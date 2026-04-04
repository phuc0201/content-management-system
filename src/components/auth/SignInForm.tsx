import { Spin } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { EyeCloseIcon, EyeIcon } from "../../assets/icons";
import { PATH } from "../../constants/path.constant";
import { useAuth } from "../../providers/AuthProvider";
import { useSignInMutation } from "../../services/auth.service";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

type AuthData = {
  email: string;
  password: string;
};

type AuthErrors = Partial<Record<keyof AuthData, string>>;

function validate(data: AuthData): AuthErrors {
  const errors: AuthErrors = {};
  if (!data.email.trim()) errors.email = "Email không được để trống";
  if (!data.password.trim()) errors.password = "Mật khẩu không được để trống";
  return errors;
}

export default function SignInForm() {
  const navigate = useNavigate();
  const [authData, setAuthData] = useState<AuthData>({ email: "", password: "" });
  const [errors, setErrors] = useState<AuthErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [signIn, { isLoading }] = useSignInMutation();
  const { setToken } = useAuth();

  const handleChange = (field: keyof AuthData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSignIn = async () => {
    const validationErrors = validate(authData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const data = await signIn(authData).unwrap();
      setToken(data.accessToken);
      if (data?.accessToken) {
        toast.success("Đăng nhập thành công!");
        navigate(PATH.ABOUT);
      }
    } catch (error) {
      toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin và thử lại.");
      error instanceof Error && console.error("Sign in failed:", error.message);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Đăng nhập
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Chào mừng bạn đến với trang quản trị của chúng tôi!
            </p>
          </div>
          <div>
            <form
              onSubmit={(e: any) => {
                e.preventDefault();
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSignIn();
                } else handleSignIn();
              }}
            >
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    value={authData.email}
                    onChange={handleChange("email")}
                  />
                  {errors.email && <p className="mt-1 text-sm text-error-500">{errors.email}</p>}
                </div>
                <div>
                  <Label>
                    Mật khẩu <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      value={authData.password}
                      onChange={handleChange("password")}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-error-500">{errors.password}</p>
                  )}
                </div>
                <div>
                  <Button type="submit" className="w-full" size="md">
                    {isLoading ? (
                      <div className="flex items-center gap-4">
                        <Spin style={{ color: "#fff" }} size="small" />
                        <span> Đang đăng nhập...</span>
                      </div>
                    ) : (
                      "Đăng nhập"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
