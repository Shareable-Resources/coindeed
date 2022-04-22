import Header from "./Header/Header";
import Footer from "./Footer/Footer";

const Layout = ({ children }: { children: any }) => {
	return (
		<div className="content">
			<Header />
			{children}
			<Footer />
		</div>
	);
};

export default Layout;
