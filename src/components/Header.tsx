'use client';

import Image from 'next/image';
import mobDark from './../images/bg-mobile-dark.jpg';
import desDark from './../images/bg-desktop-dark.jpg';
import mobLight from './../images/bg-mobile-light.jpg';
import desLight from './../images/bg-desktop-light.jpg';
import { useThemeStore } from './store/useThemeStore';

const Header = () => {
  const { theme } = useThemeStore();

  return (
    <header className="relative w-[100dvw] h-auto">
      {theme === 'theme1' ? (
        <>
          <Image
            src={mobDark}
            className="w-full lg:hidden"
            alt=""
            aria-hidden="true"
          />
          <Image
            src={desDark}
            className="hidden w-full lg:block"
            alt=""
            aria-hidden="true"
          />
        </>
      ) : (
        <>
          <Image
            src={mobLight}
            className="w-full lg:hidden"
            alt=""
            aria-hidden="true"
          />
          <Image
            src={desLight}
            className="hidden w-full lg:block"
            alt=""
            aria-hidden="true"
          />
        </>
      )}
    </header>
  );
};

export default Header;
