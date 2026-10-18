'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TiptapEditor } from '@/components/ui/TiptapEditor';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { uploadImageToR2 } from '@/lib/r2';

export default function NewBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const result = await uploadImageToR2(file, 'blog');
      setFeaturedImage(result.url);
      toast.success('Image uploaded successfully');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      excerpt: formData.get('excerpt'),
      content,
      featuredImage,
      status: formData.get('status'),
    };

    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Blog post created successfully!');
        router.push('/admin/blog');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create blog post');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <ArrowLeft size={18} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">New Blog Post</h1>
            <p className="text-sm text-slate-500">Create a new article for the Aron Bites blog.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="form-label">Post Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  className="form-input" 
                  placeholder="The Art of Making Perfect Indori Sev" 
                  onChange={(e) => {
                    // Auto-generate slug if it's empty (in a real app, bind this properly)
                    const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement;
                    if (slugInput && !slugInput.value) {
                      slugInput.value = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    }
                  }}
                />
              </div>
              
              <div>
                <label className="form-label">Excerpt *</label>
                <textarea 
                  name="excerpt" 
                  required 
                  rows={3} 
                  className="form-input py-2" 
                  placeholder="A short summary of the post..."
                />
                <p className="text-xs text-slate-500 mt-1">This will be shown on the blog listing page.</p>
              </div>

              <div>
                <label className="form-label mb-2 block">Content *</label>
                <TiptapEditor content={content} onChange={setContent} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="form-label">Status</label>
                <select name="status" className="form-select">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="form-label">URL Slug *</label>
                <input type="text" name="slug" required className="form-input text-sm" placeholder="art-of-making-sev" />
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center">
                  <Save size={16} className="mr-2" />
                  {loading ? 'Saving...' : 'Save Post'}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
              <CardDescription>Upload an image for the blog preview card.</CardDescription>
            </CardHeader>
            <CardContent>
              {featuredImage ? (
                <div className="space-y-3">
                  <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-50 relative">
                    <img src={featuredImage} alt="Featured" className="w-full h-full object-cover" />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setFeaturedImage('')}
                    className="text-sm text-red-600 hover:text-red-700 font-medium w-full text-center"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Click to upload image</p>
                  <p className="text-xs text-slate-500 mb-4">PNG, JPG or WebP (max. 2MB)</p>
                  <input
                    type="file"
                    id="featured-image"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  <label 
                    htmlFor="featured-image" 
                    className="btn btn-outline btn-sm cursor-pointer"
                  >
                    {uploadingImage ? 'Uploading...' : 'Browse Files'}
                  </label>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}