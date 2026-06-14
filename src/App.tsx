import { Routes, Route } from "react-router-dom";
import { ProgressProvider } from "@/lib/progressStore";
import { GrowthProvider } from "@/components/GrowthProvider";
import ScrollToTop from "@/components/ScrollToTop";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import StudyPage from "@/pages/StudyPage";
import ExamPage from "@/pages/ExamPage";
import WeekNotesPage from "@/pages/WeekNotesPage";
import ConceptsPage from "@/pages/ConceptsPage";
import WrongNotePage from "@/pages/WrongNotePage";
import CharacterPage from "@/pages/CharacterPage";
import AboutPage from "@/pages/AboutPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <ProgressProvider>
      <GrowthProvider>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="me" element={<CharacterPage />} />
            <Route path="exam" element={<ExamPage />} />
            <Route path="study" element={<StudyPage />} />
            <Route path="weeks" element={<WeekNotesPage />} />
            <Route path="concepts" element={<ConceptsPage />} />
            <Route path="wrong" element={<WrongNotePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </GrowthProvider>
    </ProgressProvider>
  );
}
