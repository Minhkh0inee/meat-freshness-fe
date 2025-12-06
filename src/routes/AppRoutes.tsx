import { Routes, Route } from "react-router-dom";
import NotFound from "../page/NotFound";
import LandingPage from "../page/LandingPage";
import Scanner from "../page/Scanner";
import AIAssistant from "../page/AIAssistant";
import Account from "../page/Account";
import MeatDictionary from "../page/MeatDictionary";
import Blog from "../page/Blog";
import History from "../page/History";
import Premium from "../page/Premium";
import AuthLayout from "@/components/AuthLayout";
import { SignIn } from "../page/auth/SignIn";
import { SignUp } from "../page/auth/SignUp";
import Layout from "@/components/Layout";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout/>}>
        <Route index element={<LandingPage />} />
        <Route path="/scan" element={<Scanner />} />
        <Route path="/assistant" element={<AIAssistant />} />
        <Route path="/account" element={<Account />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/dictionary" element={<MeatDictionary />} />
        <Route path="/blog" element={<Blog />} />
      
      </Route>
      
      <Route element={<AuthLayout />}>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
