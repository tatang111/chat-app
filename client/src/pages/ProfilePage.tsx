import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "sonner";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext)!;
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [name, setName] = useState(authUser?.fullName);
  const [bio, setBio] = useState(authUser?.bio);
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    if (!selectedImage) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      setIsPending(true);
      return;
    }

    const render = new FileReader();
    render.readAsDataURL(selectedImage);
    render.onload = async () => {
      try {
        const base64Image = render.result;
        await updateProfile({ profilePic: base64Image, fullName: name, bio });
        navigate("/");
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsPending(false); // ✅ release pending here 
      }
    };
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-100 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg ">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg">Profile details</h3>
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.currentTarget.files?.[0];
                if (file) {
                  setSelectedImage(file);
                }
              }}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={
                selectedImage
                  ? URL.createObjectURL(selectedImage)
                  : assets.avatar_icon
              }
              alt=""
              className={`w-12 h-12 ${selectedImage && "rounded-full"}`}
            />
            Upload profile image
          </label>

          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            required
            placeholder="Write profile bio"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            rows={4}
          ></textarea>
          <button
            disabled={isPending}
            type="submit"
            className="bg-gradient-to-r disabled:opacity-50 disabled:cursor-not-allowed from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer "
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </form>
        <img
          className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${
            selectedImage && "rounded-full"
          }`}
          src={authUser?.profilePic || assets.logo_icon}
          alt=""
        />
      </div>
    </div>
  );
};

export default ProfilePage;
