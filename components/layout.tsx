import Header from './header';
interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="mx-auto w-full">
      {/* <Header /> */}
      <div className="container mx-auto">{children}</div>
    </div>
  );
}
