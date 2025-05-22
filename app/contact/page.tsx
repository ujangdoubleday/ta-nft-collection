import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Win98Window } from "@/components/ui/win98";

export default function ContactPage() {
  return (
    <main className="py-4">
      <Container>
        <Win98Window
          title="Contact Us"
          icon="/assets/icons/mail.png"
          className="mb-4"
        >
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

            <Win98Window title="Contact Form" className="p-3 space-y-3">
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
            </Win98Window>
          </div>
        </Win98Window>
      </Container>
    </main>
  );
}
