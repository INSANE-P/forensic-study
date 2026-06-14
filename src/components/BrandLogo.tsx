// 테마별 로고 — 라이트는 네이비 윤곽(df-logo.png), 다크는 밝은 윤곽(df-logo-dark.png)으로
// CSS(.dark)로 교체해 다크모드에서도 곰이 또렷이 보이게 한다.
const LIGHT = `${import.meta.env.BASE_URL}df-logo.png`;
const DARK = `${import.meta.env.BASE_URL}df-logo-dark.png`;

export default function BrandLogo({
  className = "",
  alt = "디지털 포렌식 마스코트",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <>
      <img src={LIGHT} alt={alt} draggable={false} className={`${className} dark:hidden`} />
      <img src={DARK} alt="" aria-hidden="true" draggable={false} className={`${className} hidden dark:block`} />
    </>
  );
}
