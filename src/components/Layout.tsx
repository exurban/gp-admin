import React from "react";
import Link from "next/link";
import ActiveLink from "./ActiveLink";
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
  Flex,
  styled,
  palette
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

  const StyledItem = styled(TopNav.Item)`
    &.active {
      color: ${palette("primary300")};
      box-shadow: inset 0 -2px 0 0;
    }
  `;

  const StyledSideNavItem = styled(SideNav.Item)`
    &.active {
      color: ${palette("primary")};
      background-color: ${palette("primaryShade")};
      box-shadow: inset 3px 0 0 0 ${palette("primary")};
    }
  `;

  const menuItems = [
    "Dashboard",
    "Photos",
    "Locations",
    "Photographers",
    "Subjects",
    "Tags",
    "Collections",
    "Prints"
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
                <ActiveLink activeClassName="active" aria-label="home" href={`/`} passHref={true}>
                  <StyledItem className="nav-link" fontSize="60px" fontWeight="800">
                    <Icon icon="gpLogo" marginLeft="major-2" />
                  </StyledItem>
                </ActiveLink>
                <ActiveLink
                  className="link"
                  activeClassName="active"
                  aria-label="dashboard"
                  href={`/dashboard`}
                  passHref={true}
                >
                  <StyledItem
                    className="nav-link"
                    variant="navigationText"
                    fontSize="32px"
                    fontWeight="700"
                  >
                    Dashboard
                  </StyledItem>
                </ActiveLink>
                <ActiveLink
                  className="link"
                  activeClassName="active"
                  aria-label="photos"
                  href={`/photos`}
                  passHref={true}
                >
                  <StyledItem
                    className="nav-link"
                    variant="navigationText"
                    fontSize="32px"
                    fontWeight="700"
                  >
                    Photos
                  </StyledItem>
                </ActiveLink>
                <ActiveLink
                  className="link"
                  activeClassName="active"
                  aria-label="locations"
                  href={`/locations`}
                  passHref={true}
                >
                  <StyledItem
                    className="nav-link"
                    variant="navigationText"
                    fontSize="32px"
                    fontWeight="700"
                  >
                    Locations
                  </StyledItem>
                </ActiveLink>
                <ActiveLink
                  className="link"
                  activeClassName="active"
                  aria-label="photographers"
                  href={`/photographers`}
                  passHref={true}
                >
                  <StyledItem
                    className="nav-link"
                    variant="navigationText"
                    fontSize="32px"
                    fontWeight="700"
                  >
                    Photographers
                  </StyledItem>
                </ActiveLink>
                <ActiveLink
                  className="link"
                  activeClassName="active"
                  aria-label="subjects"
                  href={`/subjects`}
                  passHref={true}
                >
                  <StyledItem
                    className="nav-link"
                    variant="navigationText"
                    fontSize="32px"
                    fontWeight="700"
                  >
                    Subjects
                  </StyledItem>
                </ActiveLink>
                <ActiveLink
                  className="link"
                  activeClassName="active"
                  aria-label="tags"
                  href={`/tags`}
                  passHref={true}
                >
                  <StyledItem
                    className="nav-link"
                    variant="navigationText"
                    fontSize="32px"
                    fontWeight="700"
                  >
                    Tags
                  </StyledItem>
                </ActiveLink>
                <ActiveLink
                  className="link"
                  activeClassName="active"
                  aria-label="collections"
                  href={`/collections`}
                  passHref={true}
                >
                  <StyledItem
                    className="nav-link"
                    variant="navigationText"
                    fontSize="32px"
                    fontWeight="700"
                  >
                    Collections
                  </StyledItem>
                </ActiveLink>
                <ActiveLink
                  className="link"
                  activeClassName="active"
                  aria-label="prints"
                  href={`/prints`}
                  passHref={true}
                >
                  <StyledItem
                    className="nav-link"
                    variant="navigationText"
                    fontSize="32px"
                    fontWeight="700"
                  >
                    Prints
                  </StyledItem>
                </ActiveLink>
                <ActiveLink
                  className="link"
                  activeClassName="active"
                  aria-label="mats"
                  href={`/mats`}
                  passHref={true}
                >
                  <StyledItem
                    className="nav-link"
                    variant="navigationText"
                    fontSize="32px"
                    fontWeight="700"
                  >
                    Mats
                  </StyledItem>
                </ActiveLink>
                <ActiveLink
                  className="link"
                  activeClassName="active"
                  aria-label="frames"
                  href={`/frames`}
                  passHref={true}
                >
                  <StyledItem
                    className="nav-link"
                    variant="navigationText"
                    fontSize="32px"
                    fontWeight="700"
                  >
                    Frames
                  </StyledItem>
                </ActiveLink>
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
        {children}
      </PageWithHeader>
    </>
  );
};

export default Layout;
