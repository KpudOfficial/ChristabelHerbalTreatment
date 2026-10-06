"""Blog admin."""
from django.contrib import admin
from .models import BlogPost


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'is_published', 'published_at', 'view_count', 'created_at']
    list_filter = ['is_published']
    search_fields = ['title', 'body', 'tags']
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ['is_published']
    readonly_fields = ['view_count', 'created_at', 'updated_at']
    date_hierarchy = 'published_at'
    fieldsets = (
        ('Content', {'fields': ('title', 'slug', 'author', 'excerpt', 'body', 'image', 'image_alt')}),
        ('Metadata', {'fields': ('tags', 'published_at', 'is_published')}),
        ('Stats', {'fields': ('view_count', 'created_at', 'updated_at')}),
    )
