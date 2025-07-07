"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { CLERKS, NOTARIES, FILE_TYPES } from "@/src/lib/constants";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

// Custom DatePicker Component
interface CustomDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  error?: boolean;
}

function CustomDatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày",
  error = false,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(value || new Date());
  const [inputValue, setInputValue] = React.useState(
    value ? formatDate(value) : ""
  );

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Format date as dd/MM/yyyy
  function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Parse date from dd/MM/yyyy format
  function parseDate(dateString: string): Date | null {
    const parts = dateString.split("/");
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Month is 0-indexed
    const year = parseInt(parts[2]);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (
      day < 1 ||
      day > 31 ||
      month < 0 ||
      month > 11 ||
      year < 1900 ||
      year > 2100
    )
      return null;

    const date = new Date(year, month, day);
    return date.getDate() === day &&
      date.getMonth() === month &&
      date.getFullYear() === year
      ? date
      : null;
  }

  // Get days in month
  function getDaysInMonth(date: Date): (Date | null)[] {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);

    const parsedDate = parseDate(inputVal);
    if (parsedDate) {
      onChange(parsedDate);
      setCurrentMonth(parsedDate);
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    onChange(date);
    setInputValue(formatDate(date));
    setIsOpen(false);
  };

  // Navigate months
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // Update input value when value prop changes
  React.useEffect(() => {
    setInputValue(value ? formatDate(value) : "");
    if (value) {
      setCurrentMonth(value);
    }
  }, [value]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`pr-10 ${error ? "border-red-500" : ""}`}
          onClick={() => setIsOpen(false)} // Close calendar when clicking input
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={() => setIsOpen(!isOpen)}
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none">
          <div className="p-3">
            {/* Header with Month/Year Selectors */}
            <div className="flex items-center justify-between mb-4 gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => navigateMonth("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                <select
                  value={currentMonth.getMonth()}
                  onChange={(e) => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setMonth(parseInt(e.target.value));
                    setCurrentMonth(newMonth);
                  }}
                  className="text-sm font-medium px-2 py-1 rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                >
                  {monthNames.map((month, index) => (
                    <option
                      key={index}
                      value={index}
                      className="bg-background text-foreground"
                    >
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  value={currentMonth.getFullYear()}
                  onChange={(e) => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setFullYear(parseInt(e.target.value));
                    setCurrentMonth(newMonth);
                  }}
                  className="text-sm font-medium px-2 py-1 rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                >
                  {Array.from({ length: 101 }, (_, i) => {
                    const year = new Date().getFullYear() - 100 + i;
                    return (
                      <option
                        key={year}
                        value={year}
                        className="bg-background text-foreground"
                      >
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => navigateMonth("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground p-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-1" />;
                }

                const isSelected =
                  value &&
                  day.getDate() === value.getDate() &&
                  day.getMonth() === value.getMonth() &&
                  day.getFullYear() === value.getFullYear();

                const isToday =
                  day.getDate() === new Date().getDate() &&
                  day.getMonth() === new Date().getMonth() &&
                  day.getFullYear() === new Date().getFullYear();

                return (
                  <button
                    key={index}
                    type="button"
                    className={`
                                            h-8 w-8 text-sm rounded-md font-normal
                                            hover:bg-accent hover:text-accent-foreground
                                            focus:bg-accent focus:text-accent-foreground
                                            ${
                                              isSelected
                                                ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                                                : ""
                                            }
                                            ${
                                              isToday && !isSelected
                                                ? "bg-accent text-accent-foreground"
                                                : ""
                                            }
                                        `}
                    onClick={() => handleDateSelect(day)}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function FileMetaCard() {
  const { t } = useTranslation();
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const selectedDate = watch("ngayTao");

  return (
    <Card className="shadow-md border-0">
      <CardHeader className="bg-muted/50 border-b">
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-orange-600" />
          {t("fileForm.fileInfo", "Thông tin hồ sơ")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <Label htmlFor="ngayTao">
            {t("fileForm.creationDate", "Ngày tạo")} *
          </Label>
          <CustomDatePicker
            value={selectedDate || null}
            onChange={(date) => setValue("ngayTao", date)}
            placeholder="dd/MM/yyyy"
            error={!!errors.ngayTao}
          />
          {errors.ngayTao && (
            <p className="text-sm text-red-500 mt-1">
              {(errors.ngayTao as any)?.message || "Lỗi ngày tạo"}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="thuKy">{t("fileForm.clerk", "Thư ký")} *</Label>
            <Select
              value={watch("thuKy")}
              onValueChange={(value) => setValue("thuKy", value)}
            >
              <SelectTrigger className={errors.thuKy ? "border-red-500" : ""}>
                <SelectValue
                  placeholder={t("common.selectOption", "Chọn lựa chọn")}
                />
              </SelectTrigger>
              <SelectContent>
                {CLERKS.map((clerk) => (
                  <SelectItem key={clerk.value} value={clerk.value}>
                    {clerk.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.thuKy && (
              <p className="text-sm text-red-500 mt-1">
                {(errors.thuKy as any)?.message || "Lỗi thư ký"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="congChungVien">
              {t("fileForm.notary", "Công chứng viên")} *
            </Label>
            <Select
              value={watch("congChungVien")}
              onValueChange={(value) => setValue("congChungVien", value)}
            >
              <SelectTrigger
                className={errors.congChungVien ? "border-red-500" : ""}
              >
                <SelectValue
                  placeholder={t("common.selectOption", "Chọn lựa chọn")}
                />
              </SelectTrigger>
              <SelectContent>
                {NOTARIES.map((notary) => (
                  <SelectItem key={notary.value} value={notary.value}>
                    {notary.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.congChungVien && (
              <p className="text-sm text-red-500 mt-1">
                {(errors.congChungVien as any)?.message ||
                  "Lỗi công chứng viên"}
              </p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="maGiaoDich">Mã giao dịch *</Label>
            <Input
              id="maGiaoDich"
              value={watch("maGiaoDich") || ""}
              onChange={(e) => setValue("maGiaoDich", e.target.value)}
              placeholder="Nhập mã giao dịch"
              className={errors.maGiaoDich ? "border-red-500" : ""}
            />
            {errors.maGiaoDich && (
              <p className="text-sm text-red-500 mt-1">
                {(errors.maGiaoDich as any)?.message || "Lỗi mã giao dịch"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="loaiHoSo">
              {t("fileForm.fileType", "Loại hồ sơ")} *
            </Label>
            <Select
              value={watch("loaiHoSo")}
              onValueChange={(value) => setValue("loaiHoSo", value)}
            >
              <SelectTrigger
                className={errors.loaiHoSo ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Chọn loại hồ sơ" />
              </SelectTrigger>
              <SelectContent>
                {FILE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.loaiHoSo && (
              <p className="text-sm text-red-500 mt-1">
                {(errors.loaiHoSo as any)?.message || "Lỗi loại hồ sơ"}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="moTa">Mô tả</Label>
          <Textarea
            id="moTa"
            value={watch("moTa") || ""}
            onChange={(e) => setValue("moTa", e.target.value)}
            placeholder="Nhập mô tả giao dịch"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
