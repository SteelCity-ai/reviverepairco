import { getBrand, brandConfig } from "../../lib/brand";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const brand = await getBrand();
  const config = brandConfig(brand);
  return (
    <HeaderClient
      brand={brand}
      logoSrc={config.logo}
      logoAlt={config.logoAlt}
      brandName={config.name}
    />
  );
}
