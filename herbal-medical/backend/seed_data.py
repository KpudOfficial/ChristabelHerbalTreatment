"""
Seed script for Herbal Medical platform.
Usage: python manage.py shell < seed_data.py
  OR:  python seed_data.py (from backend dir with DJANGO_SETTINGS_MODULE set)
"""
import os
import sys
import django
from datetime import date, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from apps.products.models import Category, Product, Service
from apps.blog.models import BlogPost
from apps.certificates.models import Certificate
from apps.banners.models import Banner
from apps.coupons.models import Coupon
from apps.appointments.models import Availability, BlockedDate

print("Seeding database...")

# Admin user
admin, _ = User.objects.get_or_create(
    email='admin@herbalmedical.cm',
    defaults={
        'first_name': 'Dr.',
        'last_name': 'Christabel',
        'role': User.ADMIN,
        'is_staff': True,
        'is_superuser': True,
    }
)
admin.set_password('admin1234')
admin.save()
print(f"Admin: {admin.email} / admin1234")

# Sample patient
patient, _ = User.objects.get_or_create(
    email='patient@example.com',
    defaults={
        'first_name': 'John',
        'last_name': 'Doe',
        'role': User.PATIENT,
        'phone': '677000001',
    }
)
patient.set_password('patient1234')
patient.save()
print(f"Patient: {patient.email} / patient1234")

# Categories
categories_data = [
    {'name': 'Herbal Teas', 'description': 'Natural healing teas from medicinal herbs'},
    {'name': 'Essential Oils', 'description': 'Pure plant-derived therapeutic oils'},
    {'name': 'Herbal Supplements', 'description': 'Capsules and powders from natural herbs'},
    {'name': 'Topical Treatments', 'description': 'Creams, balms, and salves'},
    {'name': 'Tonics & Syrups', 'description': 'Liquid herbal preparations'},
]
categories = {}
for cat_data in categories_data:
    cat, _ = Category.objects.get_or_create(name=cat_data['name'], defaults=cat_data)
    categories[cat.name] = cat
print(f"Created {len(categories)} categories")

# Products
products_data = [
    {
        'name': 'Moringa Leaf Tea', 'category': 'Herbal Teas',
        'price': 2500, 'stock': 50,
        'description': 'Nutrient-rich moringa leaf tea packed with vitamins and antioxidants. Supports immunity and energy.',
        'short_description': 'Nutrient-rich immunity booster tea',
        'ingredients': 'Organic Moringa leaves (Moringa oleifera)',
        'usage_instructions': 'Steep 1-2 teaspoons in hot water for 5 minutes. Drink 1-2 cups daily.',
        'weight_grams': 100, 'is_featured': True,
    },
    {
        'name': 'Ginger & Lemon Wellness Tea', 'category': 'Herbal Teas',
        'price': 2000, 'stock': 40,
        'description': 'A warming blend of ginger root and lemon peel. Excellent for digestion and cold relief.',
        'short_description': 'Warming digestive and cold relief tea',
        'ingredients': 'Dried ginger root, lemon peel, licorice root',
        'usage_instructions': 'Steep 1 teaspoon in hot water for 7 minutes. Best taken after meals.',
        'weight_grams': 80, 'is_featured': True,
    },
    {
        'name': 'Lavender Essential Oil', 'category': 'Essential Oils',
        'price': 5500, 'stock': 25,
        'description': 'Pure therapeutic-grade lavender oil for relaxation, sleep, and skin care.',
        'short_description': 'Pure lavender for relaxation and sleep',
        'ingredients': '100% Lavandula angustifolia essential oil',
        'usage_instructions': 'Dilute 2-3 drops in carrier oil. Diffuse or apply topically.',
        'weight_grams': 30, 'is_featured': False,
    },
    {
        'name': 'Turmeric & Black Pepper Capsules', 'category': 'Herbal Supplements',
        'price': 4500, 'stock': 60,
        'description': 'High-potency turmeric with black pepper (piperine) for maximum curcumin absorption. Anti-inflammatory.',
        'short_description': 'High-potency anti-inflammatory supplement',
        'ingredients': 'Turmeric root extract (95% curcuminoids), Black pepper extract (piperine), Vegetable cellulose',
        'usage_instructions': 'Take 2 capsules daily with food.',
        'weight_grams': 120, 'is_featured': True,
    },
    {
        'name': 'Shea & Aloe Healing Balm', 'category': 'Topical Treatments',
        'price': 3500, 'stock': 30,
        'description': 'A rich healing balm combining African shea butter and aloe vera for dry skin, eczema, and minor irritations.',
        'short_description': 'Healing balm for dry skin and eczema',
        'ingredients': 'Shea butter, Aloe vera gel, Beeswax, Calendula extract, Vitamin E',
        'usage_instructions': 'Apply a small amount to affected area 2-3 times daily.',
        'weight_grams': 150, 'is_featured': False,
    },
    {
        'name': 'Neem & Papaya Tonic', 'category': 'Tonics & Syrups',
        'price': 6000, 'stock': 20,
        'description': 'Traditional tonic combining neem leaf and papaya for blood purification and digestive health.',
        'short_description': 'Blood purifying digestive tonic',
        'ingredients': 'Neem leaf extract, Papaya leaf extract, Honey, Spring water',
        'usage_instructions': 'Take 2 tablespoons twice daily, 30 minutes before meals.',
        'weight_grams': 500, 'is_featured': True,
    },
    {
        'name': 'Eucalyptus Chest Rub', 'category': 'Topical Treatments',
        'price': 2800, 'stock': 35,
        'description': 'Natural chest rub with eucalyptus and peppermint for respiratory relief and congestion.',
        'short_description': 'Natural respiratory relief chest rub',
        'ingredients': 'Eucalyptus oil, Peppermint oil, Camphor, Coconut oil, Beeswax',
        'usage_instructions': 'Rub on chest and throat at bedtime. Avoid contact with eyes.',
        'weight_grams': 80, 'is_featured': False,
    },
    {
        'name': 'Moringa Capsules', 'category': 'Herbal Supplements',
        'price': 5000, 'stock': 45,
        'description': 'Concentrated moringa leaf powder capsules. A complete multivitamin from nature.',
        'short_description': 'Complete natural multivitamin',
        'ingredients': 'Moringa oleifera leaf powder, Vegetable cellulose capsule',
        'usage_instructions': 'Take 2-4 capsules daily with water.',
        'weight_grams': 100, 'is_featured': False,
    },
]

for prod_data in products_data:
    cat_name = prod_data.pop('category')
    cat = categories.get(cat_name)
    prod, created = Product.objects.get_or_create(
        name=prod_data['name'],
        defaults={**prod_data, 'category': cat}
    )
print(f"Created {len(products_data)} products")

# Services
services_data = [
    {
        'name': 'General Consultation',
        'price': 5000, 'duration_minutes': 30,
        'description': 'A comprehensive general health consultation with our herbal medicine doctor. Includes assessment and personalized herbal treatment plan.',
        'short_description': '30-minute herbal health assessment',
        'is_featured': True,
    },
    {
        'name': 'Follow-up Consultation',
        'price': 3000, 'duration_minutes': 20,
        'description': 'A follow-up session to review your progress and adjust your treatment plan as needed.',
        'short_description': '20-minute progress review',
        'is_featured': True,
    },
    {
        'name': 'Chronic Disease Management',
        'price': 8000, 'duration_minutes': 60,
        'description': 'In-depth consultation for chronic conditions (diabetes, hypertension, arthritis). Includes herbal protocol and lifestyle guidance.',
        'short_description': '60-minute chronic condition consultation',
        'is_featured': True,
    },
    {
        'name': 'Herbal Detox Program Consultation',
        'price': 6000, 'duration_minutes': 45,
        'description': 'Personalized detox program design using traditional herbal protocols. Includes dietary guidance.',
        'short_description': '45-minute detox program design',
        'is_featured': False,
    },
]

for svc_data in services_data:
    Service.objects.get_or_create(name=svc_data['name'], defaults=svc_data)
print(f"Created {len(services_data)} services")

# Doctor Availability
availability_data = [
    {'day_of_week': 0, 'start_time': '08:00', 'end_time': '17:00', 'max_appointments': 12},  # Monday
    {'day_of_week': 1, 'start_time': '08:00', 'end_time': '17:00', 'max_appointments': 12},  # Tuesday
    {'day_of_week': 2, 'start_time': '08:00', 'end_time': '17:00', 'max_appointments': 12},  # Wednesday
    {'day_of_week': 3, 'start_time': '08:00', 'end_time': '17:00', 'max_appointments': 12},  # Thursday
    {'day_of_week': 4, 'start_time': '08:00', 'end_time': '15:00', 'max_appointments': 8},   # Friday
    {'day_of_week': 5, 'start_time': '09:00', 'end_time': '13:00', 'max_appointments': 4},   # Saturday
]
for avail in availability_data:
    from datetime import time
    Availability.objects.get_or_create(
        day_of_week=avail['day_of_week'],
        defaults={
            'start_time': avail['start_time'],
            'end_time': avail['end_time'],
            'max_appointments': avail['max_appointments'],
        }
    )
print("Set up availability schedule")

# Compliance Certificates
certs_data = [
    {
        'title': 'Ministry of Health Approved',
        'issuing_body': 'Cameroon Ministry of Public Health',
        'certificate_number': 'MOPH/HM/2023/0847',
        'description': 'Certified herbal medicine practice in compliance with national health regulations.',
        'valid_from': date(2023, 1, 1), 'valid_to': date(2026, 12, 31),
    },
    {
        'title': 'Certified Organic Practitioner',
        'issuing_body': 'African Organic Agriculture Association',
        'certificate_number': 'AOAA-CM-2024-112',
        'description': 'All herbal products sourced from certified organic farms.',
        'valid_from': date(2024, 3, 15), 'valid_to': date(2027, 3, 14),
    },
    {
        'title': 'Good Manufacturing Practice (GMP)',
        'issuing_body': 'National Agency for Food and Drug Administration',
        'certificate_number': 'NAFDAC/GMP/2023/CM445',
        'description': 'Products prepared under GMP-compliant conditions ensuring quality and safety.',
        'valid_from': date(2023, 6, 1), 'valid_to': date(2026, 5, 31),
    },
]
for cert_data in certs_data:
    Certificate.objects.get_or_create(title=cert_data['title'], defaults=cert_data)
print(f"Created {len(certs_data)} certificates")

# Blog Posts
blogs_data = [
    {
        'title': '5 Herbal Remedies for Boosting Your Immune System',
        'excerpt': 'Discover how traditional Cameroonian herbs can naturally strengthen your immune defenses.',
        'body': '''<h2>Nature's Pharmacy in Your Backyard</h2>
<p>Africa has a rich tradition of herbal medicine stretching back thousands of years. Here are five powerful herbs used in our practice to support immune function:</p>
<h3>1. Moringa (Moringa oleifera)</h3>
<p>Known as the "miracle tree," moringa leaves contain seven times more vitamin C than oranges and three times more iron than spinach. Regular consumption supports immune cell production and reduces inflammation.</p>
<h3>2. Neem (Azadirachta indica)</h3>
<p>Neem has potent antibacterial, antiviral, and antifungal properties. It's been used for centuries to fight infections and purify the blood.</p>
<h3>3. Ginger (Zingiber officinale)</h3>
<p>Ginger contains gingerol, a bioactive substance with powerful anti-inflammatory and antioxidant properties. It helps reduce oxidative stress and lower inflammation.</p>
<h3>4. Turmeric (Curcuma longa)</h3>
<p>Curcumin, the active compound in turmeric, is a powerful immunomodulator. It enhances the activity of immune cells while preventing chronic inflammation.</p>
<h3>5. Garlic (Allium sativum)</h3>
<p>Garlic's allicin content gives it broad-spectrum antimicrobial properties. Studies show it can reduce the severity and duration of colds and flu.</p>
<p><em>Always consult with a qualified herbal practitioner before starting any new herbal regimen.</em></p>''',
        'tags': 'immunity, moringa, turmeric, herbal remedies',
        'is_published': True,
        'published_at': timezone.now() - timedelta(days=10),
    },
    {
        'title': 'Understanding Herbal Medicine: What It Is and How It Works',
        'excerpt': 'A clear introduction to herbal medicine principles, safety, and what to expect from your first consultation.',
        'body': '''<h2>What is Herbal Medicine?</h2>
<p>Herbal medicine (also called phytotherapy) is the use of plants and plant extracts to prevent and treat illness. It is one of the oldest forms of medicine in the world and forms the foundation of many modern pharmaceuticals.</p>
<h2>How Does It Differ from Conventional Medicine?</h2>
<p>Herbal medicine uses whole plant preparations, which contain hundreds of active compounds that work synergistically. This holistic approach often produces fewer side effects than isolated pharmaceutical compounds.</p>
<h2>Is It Safe?</h2>
<p>When prescribed by a qualified practitioner and sourced from reputable suppliers, herbal medicine is generally safe. However, some herbs can interact with medications or are contraindicated in certain conditions. This is why a proper consultation is essential.</p>
<h2>What to Expect at Your First Consultation</h2>
<p>Your first consultation will last 30-60 minutes. The doctor will ask about your health history, current symptoms, diet, and lifestyle. Based on this assessment, a personalized herbal treatment plan will be created for you.</p>''',
        'tags': 'education, herbal medicine, consultation, beginners',
        'is_published': True,
        'published_at': timezone.now() - timedelta(days=5),
    },
    {
        'title': 'Managing Diabetes Naturally with Herbal Support',
        'excerpt': 'Learn how certain herbs can complement conventional diabetes management and support healthy blood sugar levels.',
        'body': '''<h2>Herbal Support for Blood Sugar Management</h2>
<p><em>Important: This article is for educational purposes only. Always consult your doctor before changing your diabetes management plan.</em></p>
<h3>Bitter Leaf (Vernonia amygdalina)</h3>
<p>Widely used in West Africa, bitter leaf has shown hypoglycemic properties in several studies. It may help reduce blood glucose levels when used consistently.</p>
<h3>Cinnamon</h3>
<p>Research suggests that cinnamon can improve insulin sensitivity and lower fasting blood sugar levels. Adding cinnamon to your diet or taking it as a supplement may be beneficial.</p>
<h3>Fenugreek</h3>
<p>Fenugreek seeds contain fiber and compounds that slow carbohydrate absorption, helping to control blood sugar spikes after meals.</p>
<h2>An Integrative Approach</h2>
<p>Herbal medicine works best when combined with a healthy diet, regular physical activity, and appropriate medical monitoring. Book a consultation to discuss a personalized protocol.</p>''',
        'tags': 'diabetes, blood sugar, bitter leaf, chronic disease',
        'is_published': True,
        'published_at': timezone.now() - timedelta(days=2),
    },
]
for blog_data in blogs_data:
    BlogPost.objects.get_or_create(
        title=blog_data['title'],
        defaults={**blog_data, 'author': admin}
    )
print(f"Created {len(blogs_data)} blog posts")

# Coupons
Coupon.objects.get_or_create(
    code='WELCOME10',
    defaults={
        'description': '10% off your first order',
        'discount_type': Coupon.PERCENTAGE,
        'value': 10,
        'valid_from': timezone.now(),
        'valid_to': timezone.now() + timedelta(days=365),
        'max_uses': 100,
    }
)
Coupon.objects.get_or_create(
    code='SAVE500',
    defaults={
        'description': '500 XAF off orders above 5000 XAF',
        'discount_type': Coupon.FIXED,
        'value': 500,
        'min_order_amount': 5000,
        'valid_from': timezone.now(),
        'valid_to': timezone.now() + timedelta(days=90),
    }
)
print("Created 2 coupons: WELCOME10, SAVE500")

print("\n✅ Seed data complete!")
print("Admin: admin@herbalmedical.cm / admin1234")
print("Patient: patient@example.com / patient1234")
