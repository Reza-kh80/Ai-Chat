import AuthForm from "@/components/AuthForm";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";

export default function Home() {
  ``
  const [activeUser, setActiveUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const activeUser = localStorage.getItem('active');
    if (activeUser === "deactive") {
      setActiveUser(activeUser);
    } else {
      router.push('/ai-chat');
    }
  }, [router]);

  return (
    <Layout title="Home">
      {activeUser && <AuthForm />}
    </Layout>
  );
}