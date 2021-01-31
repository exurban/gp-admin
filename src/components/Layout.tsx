import React from "react";
import Link from "next/link";
import Head from "next/head";
import Signin from "../components/Signin";
import { useSession, signOut } from "next-auth/client";
import {
  useColorMode,
  usePage,
  PageWithHeader,
  PageWithSidebar,
  useBreakpoint,
  Hide,
  TopNav,
  SideNav,
  Icon,
  Divider,
  Button,
  Flex
} from "bumbag";

const Layout: React.FC<{ title?: string }> = ({
  children,
  title = "Admin - Gibbs Photography"
}) => {
  const [selectedId, setSelectedId] = React.useState("home");
  const [session] = useSession();

  const { colorMode, setColorMode } = useColorMode();
  const page = usePage();
  const isDesktopAndUnder = useBreakpoint("max-desktop");
  const isDesktopAndOver = useBreakpoint("max-desktop");

  const menuItems = [
    "Dashboard",
    "Photos",
    "Locations",
    "Photographers",
    "Subjects",
    "Tags",
    "Collections",
    "Finishes"
  ];

  if (!session) {
    return (
      <>
        <Signin />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <PageWithHeader
        sticky
        headerHeight="80px"
        // maxHeight="800px"
        header={
          <>
            <TopNav
              backgroundColor="rgba(0, 0, 0, 0)"
              selectedId={selectedId}
              onChange={(id: React.SetStateAction<string>) => setSelectedId(id)}
            >
              <TopNav.Section>
                <Link href="/">
                  <TopNav.Item navId="home">
                    <Icon icon="gpLogo" fontSize="900" marginLeft="major-2" />
                  </TopNav.Item>
                </Link>
                {isDesktopAndUnder
                  ? null
                  : menuItems.map(item => (
                      <Link href={`/${item.toLowerCase()}`} passHref={true} key={item}>
                        <TopNav.Item variant="navigationText" navId={item.toLowerCase()}>
                          {item}
                        </TopNav.Item>
                      </Link>
                    ))}
              </TopNav.Section>

              <TopNav.Section marginRight="major-4">
                <TopNav.Item>
                  {session && (
                    <Button variant="ghost" palette="secondary" onClick={() => signOut()}>
                      sign out
                    </Button>
                  )}
                </TopNav.Item>
                <TopNav.Item>
                  <Button
                    variant="ghost"
                    onClick={() => setColorMode(colorMode != "default" ? "default" : "dark")}
                  >
                    {colorMode == "default" ? (
                      <Icon color="#dbe29c" icon="solid-moon" fontSize="300" />
                    ) : (
                      <Icon color="#fee61e" icon="solid-sun" fontSize="300" />
                    )}
                  </Button>
                </TopNav.Item>
                <Hide above="desktop">
                  <TopNav.Item>
                    <Button variant="ghost" onClick={page.sidebar.toggle}>
                      <Icon aria-label="Mobile Menu" icon="solid-bars" />
                    </Button>
                  </TopNav.Item>
                </Hide>
              </TopNav.Section>
            </TopNav>
          </>
        }
      >
        {isDesktopAndOver ? page.sidebar.close : null}
        <PageWithSidebar
          defaultIsVisible={false}
          minHeight="calc(100vh - 180px)"
          sidebar={
            <SideNav.Level>
              <Flex justifyContent="space-between">
                <Icon aria-label="logo" icon="gpLogo" fontSize="800" margin="major-2" />
                <Button
                  variant="ghost"
                  margin="major-2"
                  onClick={() => setColorMode(colorMode != "default" ? "default" : "dark")}
                >
                  {colorMode == "default" ? (
                    <Icon color="#dbe29c" icon="solid-moon" fontSize="300" />
                  ) : (
                    <Icon color="#fee61e" icon="solid-sun" fontSize="300" />
                  )}
                </Button>
              </Flex>

              <Divider />
              {menuItems.map(item => (
                <Link href={`/${item.toLowerCase()}`} passHref={true} key={item}>
                  <SideNav.Item
                    key={item}
                    variant="navigationText"
                    navId={item.toLowerCase()}
                    onClick={page.sidebar.close}
                  >
                    {item}
                  </SideNav.Item>
                </Link>
              ))}
            </SideNav.Level>
          }
        >
          {children}
        </PageWithSidebar>
      </PageWithHeader>
    </>
  );
};

export default Layout;
