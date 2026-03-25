import { useState } from "react";
import { ArrowRightIcon, CheckCircleIcon, PlusIcon } from "../assets/icons";
import avatarDefault from "../assets/avatar_default.png";
import ComponentCard from "../components/common/ComponentCard";
import CheckboxComponents from "../components/form/form-elements/CheckboxComponents";
import DefaultInputs from "../components/form/form-elements/DefaultInputs";
import DropzoneComponent from "../components/form/form-elements/DropZone";
import FileInputExample from "../components/form/form-elements/FileInputExample";
import InputGroup from "../components/form/form-elements/InputGroup";
import InputStates from "../components/form/form-elements/InputStates";
import RadioButtons from "../components/form/form-elements/RadioButtons";
import SelectInputs from "../components/form/form-elements/SelectInputs";
import TextAreaInput from "../components/form/form-elements/TextAreaInput";
import FormToggleSwitch from "../components/form/form-elements/ToggleSwitch";
import Alert from "../components/ui/alert/Alert";
import Avatar from "../components/ui/avatar/Avatar";
import Badge from "../components/ui/badge/Badge";
import Button from "../components/ui/button/Button";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import ResponsiveImage from "../components/ui/images/ResponsiveImage";
import { ModalShared } from "../components/ui/modal";

const BADGE_COLORS: Array<"primary" | "success" | "error" | "warning" | "info" | "light" | "dark"> =
  ["primary", "success", "error", "warning", "info", "light", "dark"];

export default function ComponentPreview() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Component Preview
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Trang tong hop toan bo UI custom trong CMS, duoc nhom theo domain de test nhanh giao dien,
          state va dark mode.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Form Elements</h2>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <DefaultInputs />
          <InputStates />
          <SelectInputs />
          <InputGroup />
          <CheckboxComponents />
          <RadioButtons />
          <TextAreaInput />
          <FileInputExample />
          <DropzoneComponent />
          <FormToggleSwitch />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Controls & Data Display
        </h2>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ComponentCard title="Buttons" desc="Primary/outline, size va icon slots.">
            <div className="flex flex-wrap gap-3">
              <Button startIcon={<PlusIcon className="size-4" />}>Create</Button>
              <Button endIcon={<ArrowRightIcon className="size-4" />}>Continue</Button>
              <Button variant="outline">Outline</Button>
              <Button size="sm">Small</Button>
              <Button disabled>Disabled</Button>
            </div>
          </ComponentCard>

          <ComponentCard title="Badges" desc="Matrix light/solid theo mau.">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {BADGE_COLORS.map((color) => (
                  <Badge key={`light-${color}`} color={color} variant="light">
                    {color}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {BADGE_COLORS.map((color) => (
                  <Badge
                    key={`solid-${color}`}
                    color={color}
                    variant="solid"
                    startIcon={<CheckCircleIcon className="size-3.5" />} // Dùng thì tự đổi icon nghe mấy thằng lol
                  >
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Avatars" desc="Size presets va trang thai online/offline/busy.">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Avatar src={avatarDefault} size="xsmall" />
                <Avatar src={avatarDefault} size="small" />
                <Avatar src={avatarDefault} size="medium" />
                <Avatar src={avatarDefault} size="large" />
                <Avatar src={avatarDefault} size="xlarge" />
                <Avatar src={avatarDefault} size="xxlarge" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Avatar src={avatarDefault} status="online" />
                <Avatar src={avatarDefault} status="busy" />
                <Avatar src={avatarDefault} status="offline" />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Alerts" desc="Success, error, warning, info">
            <div className="space-y-3">
              <Alert
                variant="success"
                title="Saved"
                message="Data has been updated successfully."
              />
              <Alert variant="error" title="Error" message="Something went wrong. Please retry." />
              <Alert
                variant="warning"
                title="Warning"
                message="Please review this before publishing."
              />
              <Alert
                variant="info"
                title="Information"
                message="You can learn more from documentation."
                showLink
              />
            </div>
          </ComponentCard>
        </div>

        <ComponentCard title="Table" desc="Compositional table components.">
          {/* <TableShared<PreviewArticleRow>
            title="Tên bảng"
            dataSource={PREVIEW_ARTICLE_ROWS}
            columns={PREVIEW_ARTICLE_COLUMNS}
            rowKey="id"
            enableSearch
            searchPlaceholder="Tim theo tieu de, danh muc, tac gia..."
            searchByKeys={["title", "category", "author"]}
            showAddButton
            addButtonText="Them bai viet"
            onAdd={() => window.alert("Di toi form tao moi")}
            showActions
            actionColumnTitle="Hanh dong"
            actions={PREVIEW_ARTICLE_ACTIONS}
            pagination={{
              current: 1,
              pageSize: 10,
              pageSizeOptions: [10, 20, 50],
              showSizeChanger: true,
            }}
          /> */}
          <div>Table here</div>
        </ComponentCard>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Overlay & Theme</h2>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ComponentCard title="Dropdown & Modal" desc="Interactive overlay components.">
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
              <div className="relative">
                <Button
                  variant="outline"
                  className="dropdown-toggle"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  Toggle Dropdown
                </Button>
                <Dropdown
                  isOpen={isDropdownOpen}
                  onClose={() => setIsDropdownOpen(false)}
                  className="w-52 p-2"
                >
                  <DropdownItem className="rounded-md">Edit</DropdownItem>
                  <DropdownItem className="rounded-md">Duplicate</DropdownItem>
                  <DropdownItem className="rounded-md">Delete</DropdownItem>
                </Dropdown>
              </div>
            </div>
          </ComponentCard>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Media</h2>
        <div className="space-y-6">
          <ComponentCard title="Images" desc="Responsive image layouts">
            <div className="space-y-5">
              <ResponsiveImage />
            </div>
          </ComponentCard>
        </div>
      </section>

      <ModalShared
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSaving(false);
        }}
        onSave={() => {
          setSaving(true);
          setTimeout(() => {
            setIsModalOpen(false);
            setSaving(false);
          }, 1000);
        }}
        isSaving={saving}
        title="Example Modal"
        children={<div>Nội dung customize để chỗ này</div>}
      />
    </div>
  );
}
