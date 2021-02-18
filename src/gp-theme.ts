import {
  faShoppingBag,
  faSearch,
  faMoon,
  faSun,
  faBars,
  faPlus,
  faMinus,
  faEllipsisV,
  faInfoCircle,
  faExpand,
  faCompress,
  faAt,
  faCaretUp,
  faCaretDown,
  faEdit,
  faTrashAlt,
  faTrash
} from "@fortawesome/free-solid-svg-icons";

import {
  faStar,
  faUserCircle,
  faEye,
  faEyeSlash,
  faTimesCircle
} from "@fortawesome/free-regular-svg-icons";

import {
  faGoogle,
  faApple,
  faFacebookF,
  faInstagram,
  faTwitter
} from "@fortawesome/free-brands-svg-icons";
import { ThemeConfig, css } from "bumbag";

const gpTheme: ThemeConfig = {
  global: {
    styles: {
      base: css`
        html,
        body {
          overflow: auto;
          min-height: 100%;
        }
        body {
          height: 100vh;
          background-color: "background";
        }
      `
    }
  },
  fonts: {
    importUrls: [
      "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&display=swap"
    ]
  },
  Button: {
    variants: {
      "small-text": {
        styles: {
          base: {
            fontSize: "14px",
            palette: "primary",
            variant: "ghost",
            size: "small",
            _focus: {
              boxShadow: "none"
            }
          }
        }
      }
    }
  },
  TopNav: {
    Item: {
      variants: {
        navigationText: {
          styles: {
            base: {
              fontFamily: "Raleway",
              fontSize: "32px",
              fontVariant: "small-caps",
              fontWeight: 700
            },
            focus: {
              boxShadow: "inset 0 -2px 0 0"
            }
          }
        }
      }
    }
  },
  SideNav: {
    Item: {
      variants: {
        navigationText: {
          styles: {
            base: {
              font: "Raleway",
              fontSize: "18px",
              fontVariant: "small-caps",
              fontWeight: "bold"
            },
            focus: {
              boxShadow: "none"
            }
          }
        }
      }
    }
  },
  Tag: {
    styles: {
      base: {
        _hover: {
          cursor: "pointer",
          altitude: 400
        }
      }
    }
  },
  Link: {
    styles: {
      base: {
        _hover: {
          textDecoration: "none",
          color: "primary200"
        }
      }
    }
  },
  Input: {
    variants: {
      submitInput: {
        styles: {
          base: {
            backgroundColor: "primary",
            color: "white",
            fontWeight: "bold"
          }
        }
      }
    }
  },
  Icon: {
    icons: {
      gpLogo: {
        viewBoxWidth: 64,
        viewBoxHeight: 64,
        paths: [
          "M64 32c0 17.673-14.327 32-32 32C14.327 64 0 49.673 0 32 0 14.327 14.327 0 32 0c17.673 0 32 14.327 32 32zM1.92 32c0 16.613 13.467 30.08 30.08 30.08S62.08 48.613 62.08 32 48.613 1.92 32 1.92 1.92 15.387 1.92 32zM61 32c0 16.016-12.984 29-29 29S3 48.016 3 32 15.984 3 32 3s29 12.984 29 29zM4.16 32c0 15.376 12.464 27.84 27.84 27.84S59.84 47.376 59.84 32 47.376 4.16 32 4.16 4.16 16.624 4.16 32zM56.96 34.9c0-4.852-4.253-7.383-11.741-7.383H32.914v1.002c1.898.387 2.303.844 2.303 2.444v18.492c0 1.6-.404 2.056-2.303 2.443V52.9h12.234v-1.002c-2.056-.334-2.478-.95-2.478-2.707v-6.416h2.549c6.61 0 11.742-2.672 11.742-7.875zm-7.821.299c0 3.726-1.916 6.205-5.414 6.38l-1.055.053V28.66l1.055.052c3.726.194 5.414 2.795 5.414 6.487zM7.354 27.396c0 7.735 5.695 13.026 14.308 13.026 3.797 0 7.576-.861 9.738-2.408v-7.295c0-1.512.37-1.987 2.145-2.233v-.984H22.576v.984c1.863.246 2.25.703 2.25 2.233v7.523c-.492.457-1.547.809-2.777.809-4.219 0-6.469-5.485-6.469-11.83 0-6.979 2.496-11.655 6.89-11.655 3.552 0 5.977 3.41 6.909 7.612h.95l-.142-7.453c-1.494-.95-4.43-1.53-8.033-1.53-8.191 0-14.8 4.5-14.8 13.201z"
        ]
      }
    },
    iconSets: [
      {
        icons: [
          faShoppingBag,
          faSearch,
          faSun,
          faMoon,
          faBars,
          faPlus,
          faMinus,
          faEllipsisV,
          faInfoCircle,
          faExpand,
          faCompress,
          faAt,
          faCaretUp,
          faCaretDown,
          faEdit,
          faTrash,
          faTrashAlt
        ],
        prefix: "solid-",
        type: "font-awesome"
      },
      {
        icons: [faStar, faUserCircle, faEye, faEyeSlash, faTimesCircle],
        prefix: "regular-",
        type: "font-awesome"
      },
      {
        icons: [faGoogle, faApple, faFacebookF, faInstagram, faTwitter],
        prefix: "brands-",
        type: "font-awesome"
      }
    ]
  }
};

export default gpTheme;
