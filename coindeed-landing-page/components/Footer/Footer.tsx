import style from "./style.module.scss";
import logo from "../../assets/images/Logo.png";

interface footerNavigation {
  label: string;
  link?: string;
  children?: footerNavigation[];
}

const Footer = () => {
  const dataFooterNav: footerNavigation[] = [
    {
      label: "Products",
      children: [{ label: "Ecosystem" }, { label: "Governance" }],
    },
    {
      label: "Developer",
      children: [
        { label: "Documentation" },
        { label: "GitHub" },
        { label: "Bug Bounty" },
      ],
    },
    {
      label: "Resource",
      children: [
        { label: "Whitepaper" },
        { label: "FAQs" },
        { label: "Brand Assets" },
      ],
    },
  ];
  return (
    <footer className={`${style.footer}`}>
      <div className={`${style.footerContent} container mx-auto`}>
        <div className={style.leftFooter}>
          <div className="mb-5">
            <img src={logo.src} draggable="false" alt="" />
          </div>

          <p className="mb-5 mt-0 font-size-3 leading-4" style={{ maxWidth: "360px" }}>
            CoinDeed aims to build a comprehensive, decentralized trading
            platform for the future of finance.
          </p>

          <p className="mt-auto mb-0 font-size-4">
            © 2021 Coindeed | All rights reserved.
          </p>
        </div>

        <div className={style.footerNavigation}>
          {dataFooterNav.map((el) => (
            <div key={el.label}>
              <a href="#">{el.label}</a>
              {el.children?.length
                ? el.children.map((el2) => (
                    <div key={el2.label}>
                      <a href="#">{el2.label}</a>
                    </div>
                  ))
                : null}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
