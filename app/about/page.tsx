import { Container } from "@/components/ui/container";
import {
  Welcome,
  Mission,
  Creator,
  Features,
} from "@/components/features/about";

export default function AboutPage() {
  return (
    <main className="py-4">
      <Container>
        <Welcome />
        <Mission />
        <Features />
        <Creator />
      </Container>
    </main>
  );
}
