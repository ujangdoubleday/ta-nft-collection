import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
  return (
    <main className="py-4">
      <Container>
        <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4">
          <div className="win98-bar h-6 flex items-center px-2 mb-4">
            <span className="text-white text-xs font-semibold tracking-tight">
              Contact Us
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 text-black">
              <p className="text-sm">
                <strong>Get in Touch</strong>
              </p>
              <p className="text-xs">
                Have questions about MyNFTs.exe or digital art creation? We'd
                love to hear from you! Fill out the form and our team will get
                back to you as soon as possible.
              </p>

              <div className="win98-shadow-inset p-3 bg-white">
                <p className="text-sm mb-2">
                  <strong>Contact Information</strong>
                </p>
                <div className="space-y-1">
                  <p className="text-xs">
                    Email: support@pixelvault.example.com
                  </p>
                  <p className="text-xs">Phone: (555) 123-4567</p>
                  <p className="text-xs">Hours: Monday-Friday, 9am-5pm</p>
                </div>
              </div>
            </div>

            <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3 space-y-3">
              <div>
                <label className="text-black text-xs block mb-1">Name</label>
                <Input placeholder="Enter your name" />
              </div>

              <div>
                <label className="text-black text-xs block mb-1">Email</label>
                <Input type="email" placeholder="Enter your email" />
              </div>

              <div>
                <label className="text-black text-xs block mb-1">Subject</label>
                <Input placeholder="Enter subject" />
              </div>

              <div>
                <label className="text-black text-xs block mb-1">Message</label>
                <textarea
                  className="w-full bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 text-sm h-24"
                  placeholder="Enter your message"
                ></textarea>
              </div>

              <div className="flex justify-end mt-2">
                <Button>Send Message</Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
