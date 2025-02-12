import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();
    dispatch(registerUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
        navigate("/auth/login");
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 bg-pink-50 p-8 rounded-lg shadow-lg animate-fadeIn">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-pink-800">
          Create new account
        </h1>
        <p className="mt-2 text-pink-700">
          Already have an account?{" "}
          <Link
            className="font-medium ml-2 text-pink-600 hover:underline transition duration-200"
            to="/auth/login"
          >
            Login
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
      <div className="text-center text-pink-600 mt-4">
        <p className="text-sm">We’re excited to have you join us!</p>
      </div>
    </div>
  );
}

export default AuthRegister;
