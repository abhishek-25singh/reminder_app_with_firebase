import { useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import { useAuth } from "@/firebase/auth";
import { useRouter } from "next/router";
import Loader from "@/components/Loader";
import {
  collection,
  addDoc,
  getDocs,
  where,
  query,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function Home() {
  const [reInput, setReInput] = useState("");
  const [reminders, setReminders] = useState([]);

  const [dtInput, setDtInput] = useState("");

  const { signOut, authUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push("/login");
    }
    if (!!authUser) {
      fetchReminders(authUser.uid);
    }
  }, [authUser, isLoading]);

  const fetchReminders = async (uid) => {
    try {
      const q = query(collection(db, "todos"), where("owner", "==", uid));

      const querySnapshot = await getDocs(q);

      let data = [];
      querySnapshot.forEach((rem) => {
        data.push({ ...rem.data(), id: rem.id });
      });

      setReminders(data);
      
    } catch (error) {
      console.error("An error occured", error);
    }
  };

  const addReminder = async () => {
    try {
      if (!reInput) return;
        const docRef = await addDoc(collection(db, "todos"), {
            owner: authUser.uid,
            content: reInput,
            datetime: dtInput,
            completed: false,
          });

     fetchReminders(authUser.uid);

     setReInput("");
      setDtInput("");
    } catch (error) {
      console.error("An error occured", error);
    }
  };

  const deleteReminder = async (docId) => {
    try {
      await deleteDoc(doc(db, "todos", docId));

      fetchReminders(authUser.uid);
    } catch (error) {
      console.error("An error occured", error);
    }
  };

  const makeAsCompleteHander = async (event, docId) => {
    try {
      const remRef = doc(db, "todos", docId);
      await updateDoc(remRef, {
        completed: event.target.checked,
      });
      fetchReminders(authUser.uid);
    } catch (error) {
      console.error("An error occured", error);
    }
  };

  return !authUser ? (
    <Loader />
  ) : (
    <main className="">
      <div
        className="bg-black text-white w-40 py-4 mt-10 rounded-full transition-transform hover:bg-black/[0.8] active:scale-90 flex items-center justify-center gap-2 font-medium shadow-md fixed bottom-5 right-5 cursor-pointer"
        onClick={signOut}
      >
        <span>Sign out</span>
      </div>

      <div className="max-w-3xl mx-auto mt-10 p-8">
        <div className="bg-white -m-6 p-3 sticky top-0">
          <div className="flex justify-center flex-col items-center">
            <h1 className="text-5xl md:text-7xl font-bold">Reminder's</h1>
          </div>
          <div className="flex items-center gap-2 mt-10">
            <input
              placeholder={`Hi ${authUser.username}, add your reminder`}
              type="text"
              className="font-semibold placeholder:text-gray-500 border-[2px] border-black h-[60px] grow shadow-sm rounded-md px-4 focus-visible:outline-yellow-400 text-lg transition-all duration-300"
              value={reInput}
              onChange={(e) => setReInput(e.target.value)}
              required
            />
            <input
              type="datetime-local"
              className="font-semibold placeholder:text-gray-500 border-[2px] border-black h-[60px] grow shadow-sm rounded-md px-4 focus-visible:outline-yellow-400 text-lg transition-all duration-300"
              value={dtInput}
              onChange={(e) => setDtInput(e.target.value)}
            />
            <button
              className="w-[60px] h-[60px] rounded-md bg-black flex justify-center items-center cursor-pointer transition-all duration-300 hover:bg-black/[0.8]"
              onClick={addReminder}
            >
              <AiOutlinePlus size={30} color="#fff" />
            </button>
          </div>
        </div>
        <div className="my-10">
          {reminders.length > 0 &&
            reminders.map((rem) => (
              <div
                key={rem.id}
                className="flex items-center justify-between mt-4"
              >
                <div className="flex items-center gap-3">
                  <input
                    id={`reminder-${rem.id}`}
                    type="checkbox"
                    className="w-4 h-4 accent-green-400 rounded-lg"
                    checked={rem.completed}
                    onChange={(e) => makeAsCompleteHander(e, rem.id)}
                  />
                  <label
                    htmlFor={`reminder-${rem.id}`}
                    className={`font-medium ${
                        rem.completed ? "line-through" : ""
                    }`}
                  >
                    {"  "}
                    {rem.content}
                    {"  "}
                  </label>
                  {" | "}
                  <label
                    htmlFor={`reminder-${rem.id}`}
                    className={`font-medium ${
                        rem.completed ? "line-through" : ""
                    }`}
                  >
                    {"  "}
                  {rem.datetime}
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <MdDeleteForever
                    size={24}
                    className="text-red-400 hover:text-red-600 cursor-pointer"
                    onClick={() => deleteReminder(rem.id)}
                  />
                </div>
              </div>
            ))}

          {reminders.length < 1 && (
            <span className="text-center w-full block text-2xl font-medium text-gray-400 mt-28">{`You don't have any reminder's`}</span>
          )}
        </div>
      </div>
    </main>
  );
}
