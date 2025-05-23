"use client";

import { useState } from "react";
import { Win98Window } from "@/components/ui/win98";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
};

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general",
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally send the form data to a server
    console.log("Form submitted:", formData);
    // Show success message
    setShowSuccess(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        category: "general",
      });
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <Win98Window
      title="Message Form"
      icon="/assets/icons/form.png"
      className="mb-4"
    >
      <div className="p-4 text-black">
        <div className="mb-4 win98-shadow-inset p-3 bg-white">
          <p className="text-xs">
            Have a question, suggestion, or just want to say hello? Fill out the
            form below and I'll get back to you as soon as possible. All fields
            marked with * are required.
          </p>
        </div>

        {showSuccess && (
          <div className="mb-4 bg-[#c1ffc1] p-2 border-[2px] border-t-[#008000] border-l-[#008000] border-r-[#00ff00] border-b-[#00ff00]">
            <p className="text-xs text-[#005000] font-bold">
              Message sent successfully!
            </p>
            <p className="text-xs text-[#005000]">
              Thank you for reaching out. I'll respond as soon as possible.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-black text-xs block mb-1">
                Name <span className="text-red-600">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="hover:border-[#0000ff] focus:border-[#0000ff]"
              />
            </div>

            <div>
              <label className="text-black text-xs block mb-1">
                Email <span className="text-red-600">*</span>
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="hover:border-[#0000ff] focus:border-[#0000ff]"
              />
            </div>
          </div>

          <div>
            <label className="text-black text-xs block mb-1">
              Subject <span className="text-red-600">*</span>
            </label>
            <Input
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Enter subject"
              required
              className="hover:border-[#0000ff] focus:border-[#0000ff]"
            />
          </div>

          <div>
            <label className="text-black text-xs block mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-sm hover:border-[#0000ff]"
            >
              <option value="general">General Question</option>
              <option value="support">Technical Support</option>
              <option value="feedback">Feedback</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-black text-xs block mb-1">
              Message <span className="text-red-600">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 text-sm h-24 hover:border-[#0000ff] focus:border-[#0000ff] focus:outline-none"
              placeholder="Enter your message"
              required
            ></textarea>
          </div>

          <div className="flex justify-end">
            <div className="flex gap-2">
              <Button
                type="reset"
                variant="outline"
                className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
                onClick={() =>
                  setFormData({
                    name: "",
                    email: "",
                    subject: "",
                    message: "",
                    category: "general",
                  })
                }
              >
                Clear
              </Button>
              <Button
                type="submit"
                className="hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
              >
                Send Message
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Win98Window>
  );
}
