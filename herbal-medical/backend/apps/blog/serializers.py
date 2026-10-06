"""Blog serializers."""
from rest_framework import serializers
from .models import BlogPost


class BlogPostListSerializer(serializers.ModelSerializer):
    tag_list = serializers.ReadOnlyField()
    author_name = serializers.CharField(source='author.full_name', read_only=True)

    class Meta:
        model = BlogPost
        fields = ('id', 'title', 'slug', 'excerpt', 'image', 'image_alt',
                  'tag_list', 'author_name', 'published_at', 'is_published', 'view_count')


class BlogPostDetailSerializer(serializers.ModelSerializer):
    tag_list = serializers.ReadOnlyField()
    author_name = serializers.CharField(source='author.full_name', read_only=True)

    class Meta:
        model = BlogPost
        fields = ('id', 'title', 'slug', 'body', 'excerpt', 'image', 'image_alt',
                  'tag_list', 'tags', 'author_name', 'published_at', 'is_published',
                  'view_count', 'created_at', 'updated_at')


class BlogPostWriteSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = BlogPost
        fields = ('title', 'body', 'excerpt', 'image', 'image_alt',
                  'tags', 'is_published', 'published_at')
