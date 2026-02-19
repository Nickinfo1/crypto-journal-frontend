import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { JournalsListPage } from '../../pages/journals-list/JournalsListPage';
import { JournalDetailPage } from '../../pages/journal-detail/JournalDetailPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JournalsListPage />} />
        <Route path="/journal/:journalId" element={<JournalDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}