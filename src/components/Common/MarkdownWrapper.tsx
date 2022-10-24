import React from 'react';
import MuiMarkdown from 'mui-markdown';
import { BeanstalkPalette, FontSize, FontWeight } from '~/components/App/muiTheme';

/**
 * Styles Markdown text to match MUI theme.
 */
import { FC } from '~/types';

const MarkdownWrapper: FC<{}> = ({ children }) => (
  <MuiMarkdown
    overrides={{
      li: {
        component: 'li',
        props: {
          style: {
            fontSize: FontSize.base,
            lineHeight: '1.25rem',
            wordBreak: 'normal'
          }
        } as React.HTMLProps<HTMLParagraphElement>,
      },
      p: {
        component: 'p',
        props: {
          style: {
            marginTop: '10px',
            fontSize: FontSize.base,
            lineHeight: '1.25rem',
            wordBreak: 'normal'
          }
        } as React.HTMLProps<HTMLParagraphElement>,
      },
      h1: {
        component: 'h1',
        props: {
          style: {
            marginTop: '10px',
            marginBottom: '0px',
            fontFamily: 'Futura PT',
            fontSize: FontSize['2xl'], // 24px
            fontWeight: FontWeight.medium,
            wordBreak: 'normal'
          },
        } as React.HTMLProps<HTMLParagraphElement>,
      },
      h2: {
        component: 'h2',
        props: {
          style: {
            marginTop: '10px',
            marginBottom: '0px',
            fontFamily: 'Futura PT',
            fontSize: FontSize['1xl'], // 20px
            fontWeight: FontWeight.medium,
            lineHeight: '1.875rem',
            wordBreak: 'normal'
          },
        } as React.HTMLProps<HTMLParagraphElement>,
      },
      h3: {
        component: 'h3',
        props: {
          style: {
            marginTop: '10px',
            marginBottom: '0px',
            fontSize: FontSize.lg, // 18px
            fontWeight: FontWeight.normal,
            wordBreak: 'normal'
          },
        } as React.HTMLProps<HTMLParagraphElement>,
      },
      h4: {
        component: 'h4',
        props: {
          style: {
            marginTop: '10px',
            marginBottom: '0px',
            fontSize: FontSize.base, // 16px
            fontWeight: FontWeight.normal,
            lineHeight: '1.25rem',
            wordBreak: 'normal'
          },
        } as React.HTMLProps<HTMLParagraphElement>,
      },
      code: {
        props: {
          style: {
            backgroundColor: '#f4f4f4',
            borderRadius: 3,
            margin: 1,
            padding: 0.75,
            paddingRight: 3,
            paddingLeft: 3
          }
        }
      },
      // table: {
      //   props: {
      //     style: {
      //       display: 'block',
      //       overflow: 'scroll',
      //       maxWidth: '100%',
      //     }
      //   }
      // },
      a: {
        props: {
          style: {
            wordBreak: 'break-word',
            color: BeanstalkPalette.theme.fallDark.primary,
          }
        }
      }
    }}
  >
    {children as any}
  </MuiMarkdown>
);

export default MarkdownWrapper;
