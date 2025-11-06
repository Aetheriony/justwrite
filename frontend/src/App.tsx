import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Blog } from './pages/Blog'
import { Blogs } from "./pages/Blogs";
import { Publish } from './pages/Publish';
import { HomePage } from './pages/HomePage';
import NotificationContainer from './components/Notification';
import { React } from './pages/tags/React';
import { JavaScript } from './pages/tags/JavaScript';
import { Nodejs } from './pages/tags/Nodejs';
import { Devops } from './pages/tags/Devops';
import { MachineLearning } from './pages/tags/MachineLearning';
import { AWS } from './pages/tags/AWS';
import { Cloudflare } from './pages/tags/Cloudflare';
import UpdateBlogPage from './pages/UpdateBlog';
import { Politics } from './pages/tags/Politics';
import { Finance } from './pages/tags/Finance';
import { Career } from './pages/tags/Career';
import { Explore } from './pages/tags/Explore';
import { NotificationsPage } from './components/NotificationsPage';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/publish" element={<Publish />} />
          {/* -----------------------tags router------------------ */}
          <Route path="/tags/React" element={<React />} />
          <Route path="/tags/JavaScript" element={<JavaScript />} />
          <Route path="/tags/MachineLearning" element={<MachineLearning />} />
          <Route path="/tags/Devops" element={<Devops />} />
          <Route path="/tags/Nodejs" element={<Nodejs />} />
          <Route path="/tags/AWS" element={<AWS />} />
          <Route path="/tags/Cloudflare" element={<Cloudflare />} />
          <Route path="/tags/Career" element={<Career />} />
          <Route path="/tags/Finance" element={<Finance />} />
          <Route path="/tags/Politics" element={<Politics />} />
          <Route path="/tags/Explore" element={<Explore />} />
          <Route path="/notifications" element={<NotificationsPage/>} />


          <Route path="/blog/update/:id" element={<UpdateBlogPage />} />

        </Routes>
        <NotificationContainer />
      </BrowserRouter>
    </>
  )
}

export default App
