import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <BrandLogo className="h-24 w-24 opacity-90" alt="" />
      <h1 className="mt-5 text-2xl font-extrabold text-foreground">페이지를 찾을 수 없어요</h1>
      <p className="mt-2 text-muted-strong">주소가 바뀌었거나 없는 페이지예요.</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-1.5 rounded-2xl bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-light"
      >
        대시보드로 돌아가기
      </Link>
    </div>
  );
}
