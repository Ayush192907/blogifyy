import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';

// Lazy load Public pages
const HomePage = lazy(() => import('./pages/public/HomePage'));
const BlogPage = lazy(() => import('./pages/public/BlogPage'));
const CategoryPage = lazy(() => import('./pages/public/CategoryPage'));
const PostDetailPage = lazy(() => import('./pages/public/PostDetailPage'));
const SearchPage = lazy(() => import('./pages/public/SearchPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const StaticPage = lazy(() => import('./pages/public/StaticPage'));

// Lazy load Admin pages
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const PostsPage = lazy(() => import('./pages/admin/PostsPage'));
const CreateEditPostPage = lazy(() => import('./pages/admin/CreateEditPostPage'));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const PagesPage = lazy(() => import('./pages/admin/PagesPage'));
const CreateEditPagePage = lazy(() => import('./pages/admin/CreateEditPagePage'));
const AdsPage = lazy(() => import('./pages/admin/AdsPage'));
const SubscribersPage = lazy(() => import('./pages/admin/SubscribersPage'));
const MessagesPage = lazy(() => import('./pages/admin/MessagesPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

// Layouts (keep sync since it's the core frame wrapper)
import AdminLayout from './components/admin/AdminLayout';

function PostRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/blogs/${slug}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/blog" element={<Navigate to="/blogs" replace />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/blogs/:slug" element={<PostDetailPage />} />
          <Route path="/post/:slug" element={<PostRedirect />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin Login (unprotected) */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Admin Routes (protected via AdminLayout wrapper) */}
          <Route path="/admin" element={<AdminLayout title="Dashboard"><DashboardPage /></AdminLayout>} />
          <Route path="/admin/posts" element={<AdminLayout title="All Posts"><PostsPage /></AdminLayout>} />
          <Route path="/admin/posts/new" element={<AdminLayout title="New Post"><CreateEditPostPage /></AdminLayout>} />
          <Route path="/admin/posts/:id/edit" element={<AdminLayout title="Edit Post"><CreateEditPostPage /></AdminLayout>} />
          <Route path="/admin/categories" element={<AdminLayout title="Categories"><CategoriesPage /></AdminLayout>} />
          <Route path="/admin/pages" element={<AdminLayout title="Pages"><PagesPage /></AdminLayout>} />
          <Route path="/admin/pages/new" element={<AdminLayout title="New Page"><CreateEditPagePage /></AdminLayout>} />
          <Route path="/admin/pages/:id/edit" element={<AdminLayout title="Edit Page"><CreateEditPagePage /></AdminLayout>} />
          <Route path="/admin/ads" element={<AdminLayout title="Ads Manager"><AdsPage /></AdminLayout>} />
          <Route path="/admin/subscribers" element={<AdminLayout title="Subscribers"><SubscribersPage /></AdminLayout>} />
          <Route path="/admin/messages" element={<AdminLayout title="Messages"><MessagesPage /></AdminLayout>} />
          <Route path="/admin/settings" element={<AdminLayout title="Settings"><SettingsPage /></AdminLayout>} />

          {/* Dynamic Static Pages catch-all */}
          <Route path="/:slug" element={<StaticPage />} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}