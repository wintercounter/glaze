import { graphql, useStaticQuery } from 'gatsby';
import { GlazeProvider } from 'glaze';
import React from 'react';
import { Helmet } from 'react-helmet';

import theme from '../gatsby-plugin-glaze/theme.treat';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): JSX.Element {
  const data = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          name
          description
        }
      }
    }
  `);

  return (
    <React.StrictMode>
      <Helmet
        titleTemplate={`%s - ${data.site.siteMetadata.name}`}
        defaultTitle={data.site.siteMetadata.name}
      >
        <meta name="description" content={data.site.siteMetadata.description} />
      </Helmet>

      <GlazeProvider theme={theme}>
        <header>{/* TODO */}</header>

        <main>{children}</main>

        <footer>{/* TODO */}</footer>
      </GlazeProvider>
    </React.StrictMode>
  );
}
