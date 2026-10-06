"""Admin dashboard API — sales and booking stats."""
from datetime import date, timedelta
from django.db.models import Sum, Count, F, ExpressionWrapper, DecimalField
from django.db.models.functions import TruncDay, TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from .models import Order, OrderItem
from apps.appointments.models import Appointment


class DashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = date.today()

        # ── Today stats ──────────────────────────────────────────────────────
        today_orders = Order.objects.filter(created_at__date=today)
        today_revenue = (
            today_orders.filter(status=Order.PAID)
            .aggregate(total=Sum('total'))['total'] or 0
        )
        today_bookings = Appointment.objects.filter(date=today).count()
        pending_orders = Order.objects.filter(status=Order.PENDING).count()

        # ── Weekly revenue chart (last 7 days) ────────────────────────────────
        weekly_data = list(
            Order.objects.filter(
                status=Order.PAID,
                created_at__date__gte=today - timedelta(days=6),
            )
            .annotate(day=TruncDay('created_at'))
            .values('day')
            .annotate(revenue=Sum('total'), orders=Count('id'))
            .order_by('day')
        )

        # ── Monthly revenue (last 6 months) ───────────────────────────────────
        monthly_data = list(
            Order.objects.filter(
                status=Order.PAID,
                created_at__date__gte=today - timedelta(days=180),
            )
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('total'), orders=Count('id'))
            .order_by('month')
        )

        # ── Recent orders ─────────────────────────────────────────────────────
        recent_orders = (
            Order.objects.select_related('user')
            .prefetch_related('items__product')
            .order_by('-created_at')[:10]
        )
        from .serializers import OrderSerializer
        recent_orders_data = OrderSerializer(recent_orders, many=True).data

        # ── Recent appointments ───────────────────────────────────────────────
        recent_appointments = (
            Appointment.objects.select_related('user', 'service')
            .order_by('-created_at')[:10]
        )
        from apps.appointments.serializers import AppointmentSerializer
        recent_appointments_data = AppointmentSerializer(recent_appointments, many=True).data

        # ── Top products by revenue ───────────────────────────────────────────
        revenue_expr = ExpressionWrapper(
            F('unit_price') * F('quantity'),
            output_field=DecimalField()
        )
        top_products = list(
            OrderItem.objects.filter(order__status=Order.PAID)
            .values('product__name', 'product__id')
            .annotate(total_revenue=Sum(revenue_expr), total_sold=Sum('quantity'))
            .order_by('-total_revenue')[:5]
        )

        return Response({
            'today': {
                'revenue': float(today_revenue),
                'orders': today_orders.count(),
                'bookings': today_bookings,
                'pending_orders': pending_orders,
            },
            'weekly_chart': weekly_data,
            'monthly_chart': monthly_data,
            'recent_orders': recent_orders_data,
            'recent_appointments': recent_appointments_data,
            'top_products': top_products,
        })
