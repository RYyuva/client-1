"use client";

import { API_URL } from "@/utils/config";
import { LatLngTuple } from "leaflet";
import dynamic from "next/dynamic";
import { useState } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useAuthStore, User } from "@/utils/auth_store";

import { ToastContainer, toast } from 'react-toastify';


const DynamicMap = dynamic(() => import("../components/Map"), {
  ssr: false,
});

interface TMeta {
  title: string;
  description: string;
}

export default function Home() {
  const [ll, setLL] = useState<LatLngTuple>([51.59851648934695,-0.33021007557360366]);
  const [formText, setFormText] = useState<string>("");
  const [meta, setMeta] = useState<TMeta>({ title: "", description: "" });

  const { user, setUser, clearUser } = useAuthStore((e) => e);

  return (
    <main className="flex h-screen w-full">
      {/* ============== MAP SECTION =========== */}
      <section className="bg-red-200 h-full w-full">
        <DynamicMap latlng={[ll, setLL]} />
      </section>

      {/* ============== CHAT SECTION =========== */}
      <section className="bg-[#f0f0f0] border-l-2 h-full w-full max-w-sm flex flex-col p-3 py-10">
        <section className="min-h-10 pb-5">
          {user !== null && (
            <section className="flex space-x-5 font-mono">
              <img className="w-14 h-14 rounded-full" src={user.picture} />
              <div className="flex flex-col items-start justify-center">
                <h1 className="text-xl">{user.name}</h1>
                <button onClick={() => {
                  clearUser();
                  googleLogout();
                  toast.success('Logout Sucessfully', {
                      position: "top-left",
                      autoClose: 5000,
                      hideProgressBar: true,
                      closeOnClick: false,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "light",
                    });
                }} className="text-sm text-red-500 hover:text-red-300">Logout</button>
              </div>
            </section>
          )}
          {user === null && (
            <GoogleLogin
              onSuccess={(tokenResponse) => {
                if (tokenResponse.credential === "") return -1;
                const user: User = jwtDecode(tokenResponse.credential || "");
                console.log(user.email);
                setUser(user);
                toast.success('Login Sucessfully', {
                    position: "top-left",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                  });
              }}
              onError={() => {
                toast.error('Login Failed', {
                    position: "top-left",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                  });
              }}
            />
          )}
        </section>
        <section className="h-0 flex-grow">
          <h1 className="text-5xl font-mono">
            {meta.title ? meta.title : "ASK QUESTION"}
          </h1>
          <h1 className="text-xl font-mono text-gray-500 pt-5">
            {meta.description && ""}
          </h1>
          <p className="text-md font-mono pt-3 ">
            {meta.description ? meta.description : ""}
          </p>
        </section>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (user === null) {
              toast.error('Login First', {
                  position: "top-left",
                  autoClose: 5000,
                  hideProgressBar: true,
                  closeOnClick: false,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                });
              return;
            };

            const fetch_data = async () => {
              const response = await fetch(`${API_URL}/api/v1/get-location`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: formText }),
              });
              const data = await response.json();

              console.log(data);

              setLL(data.data.coordinate);
              setMeta({
                title: data.data.title,
                description: data.data.description,
              });
            };
            try {
              fetch_data();
            } catch (e) {}
          }}
          className=" flex w-full space-x-3"
        >
          <input
            onChange={(e) => setFormText(e.target.value)}
            className="h-10 w-0 flex-grow rounded-md p-2 font-mono border"
            value={formText}
            placeholder="How May I Help You? "
            type="text"
          />
          <button className="px-5 bg-green-600 text-white font-mono font-bold rounded-md hover:bg-green-500 hover:text-gray-100">
            ASK
          </button>
        </form>
      </section>
      <ToastContainer
        position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </main>
  );
}
