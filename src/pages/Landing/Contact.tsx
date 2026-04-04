import { useState } from "react";
import { toast } from "react-toastify";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import { useCreateNotificationMutation } from "../../services/notification.service";
import { useGetConfigQuery } from "../../services/siteConfig.service";

type FormState = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function LandingContactPage() {
  const { data: config } = useGetConfigQuery();
  const [createNotification, { isLoading }] = useCreateNotificationMutation();

  const [contactForm, setContactForm] = useState<FormState>(EMPTY_FORM);
  const [partnerForm, setPartnerForm] = useState<FormState>(EMPTY_FORM);

  const lat = config?.contactInfor?.lat;
  const lng = config?.contactInfor?.lng;
  const hasMap = typeof lat === "number" && typeof lng === "number";
  const mapEmbedUrl = hasMap
    ? `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`
    : "";

  const submitForm = async (
    type: "contact" | "partner",
    form: FormState,
    reset: () => void,
  ) => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.message.trim()
    ) {
      toast.warning("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      await createNotification({
        type,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
      }).unwrap();

      toast.success(
        type === "contact" ? "Đã gửi liên hệ." : "Đã gửi đăng ký đối tác.",
      );
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Không thể gửi biểu mẫu.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
        <h1 className="text-2xl font-semibold">Liên hệ</h1>
        <p className="mt-2 text-sm">{config?.contactInfor?.name || ""}</p>
        <p className="text-sm">{config?.contactInfor?.address || ""}</p>
        <p className="text-sm">
          Mã số thuế: {config?.contactInfor?.taxCode || ""}
        </p>
        <p className="text-sm">
          Điện thoại: {config?.contactInfor?.phoneNumber || ""}
        </p>
        <p className="text-sm">Email: {config?.contactInfor?.email || ""}</p>
        {hasMap ? (
          <iframe
            title="company-map"
            src={mapEmbedUrl}
            className="mt-3 h-64 w-full rounded-lg border border-gray-200 dark:border-gray-800"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <p className="text-sm mt-2 text-gray-500">Chưa có toạ độ bản đồ.</p>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800 space-y-3">
          <h2 className="font-semibold">Gửi liên hệ</h2>
          <Input
            value={contactForm.name}
            onChange={(e) =>
              setContactForm((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="Họ và tên"
          />
          <Input
            value={contactForm.email}
            onChange={(e) =>
              setContactForm((p) => ({ ...p, email: e.target.value }))
            }
            placeholder="Email"
          />
          <Input
            value={contactForm.phone}
            onChange={(e) =>
              setContactForm((p) => ({ ...p, phone: e.target.value }))
            }
            placeholder="Số điện thoại"
          />
          <TextArea
            value={contactForm.message}
            onChange={(value) =>
              setContactForm((p) => ({ ...p, message: value }))
            }
            placeholder="Nội dung"
            rows={4}
          />
          <Button
            onClick={() =>
              void submitForm("contact", contactForm, () =>
                setContactForm(EMPTY_FORM),
              )
            }
            loading={isLoading}
          >
            Gửi liên hệ
          </Button>
        </div>

        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800 space-y-3">
          <h2 className="font-semibold">Đăng ký đối tác</h2>
          <Input
            value={partnerForm.name}
            onChange={(e) =>
              setPartnerForm((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="Họ và tên"
          />
          <Input
            value={partnerForm.email}
            onChange={(e) =>
              setPartnerForm((p) => ({ ...p, email: e.target.value }))
            }
            placeholder="Email"
          />
          <Input
            value={partnerForm.phone}
            onChange={(e) =>
              setPartnerForm((p) => ({ ...p, phone: e.target.value }))
            }
            placeholder="Số điện thoại"
          />
          <TextArea
            value={partnerForm.message}
            onChange={(value) =>
              setPartnerForm((p) => ({ ...p, message: value }))
            }
            placeholder="Nội dung"
            rows={4}
          />
          <Button
            onClick={() =>
              void submitForm("partner", partnerForm, () =>
                setPartnerForm(EMPTY_FORM),
              )
            }
            loading={isLoading}
          >
            Gửi đăng ký đối tác
          </Button>
        </div>
      </section>
    </div>
  );
}
