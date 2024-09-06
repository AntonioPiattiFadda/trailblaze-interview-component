import "../styles/globals.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Footer from "../components/Footer";
import NavBar from "../components/Navbar";
import "../public/nprogress.css";
import Script from "next/script";
import AppContext from "@/contexts/AppContext";
export default function App({ Component, pageProps }) {
  const [questions, setQuestions] = useState([]);
  const router = useRouter();

  // useEffect(() => {
  //   const handleStart = () => {
  //     setIsLoading(true);
  //     NProgress.start();
  //   };
  //   const handleComplete = () => {
  //     setIsLoading(false);
  //     NProgress.done();
  //   };

  //   router.events.on("routeChangeStart", handleStart);
  //   router.events.on("routeChangeComplete", handleComplete);
  //   router.events.on("routeChangeError", handleComplete);

  //   return () => {
  //     router.events.off("routeChangeStart", handleStart);
  //     router.events.off("routeChangeComplete", handleComplete);
  //     router.events.off("routeChangeError", handleComplete);
  //   };
  // }, []);

  return (
    <>
      {/* <NavBar /> */}
      <AppContext.Provider value={{ questions, setQuestions }}>
        <Component {...pageProps} />
      </AppContext.Provider>

      {/* <ToastContainer /> */}
      {/* {isLoading && (
        <div className="nprogress-custom-parent">
          <div className="nprogress-custom-bar" />
        </div>
      )} */}
      {/* <Footer/> */}
    </>
  );
}
