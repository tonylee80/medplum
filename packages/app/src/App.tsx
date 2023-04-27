import { Space } from '@mantine/core';
import { MEDPLUM_VERSION } from '@medplum/core';
import { UserConfiguration } from '@medplum/fhirtypes';
import { AppShell, ErrorBoundary, Loading, Logo, NavbarMenu, useMedplum } from '@medplum/react';
import {
  Icon,
  IconBrandAsana,
  IconBuilding,
  IconForms,
  IconId,
  IconLock,
  IconLockAccess,
  IconMicroscope,
  IconPackages,
  IconPlus,
  IconReceipt,
  IconReportMedical,
  IconStar,
  IconWebhook,
} from '@tabler/icons-react';
import React, { Suspense } from 'react';
import { AppRoutes } from './AppRoutes';

import './App.css';
import { Location, useLocation } from 'react-router-dom';

export function App(): JSX.Element {
  const medplum = useMedplum();
  const config = medplum.getUserConfiguration();
  const location = useLocation();
  console.log(location);

  if (medplum.isLoading()) {
    return <Loading />;
  }

  return (
    <AppShell logo={<Logo size={24} />} version={MEDPLUM_VERSION} menus={userConfigToMenu(config, location)}>
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <AppRoutes />
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}

function userConfigToMenu(config: UserConfiguration | undefined, location: Location): NavbarMenu[] {
  const result =
    config?.menu?.map((menu) => ({
      title: menu.title,
      links:
        menu.link?.map((link) => ({
          label: link.name,
          href: link.target as string,
          icon: getIcon(link.target as string),
        })) || [],
    })) || [];

  console.log(config);

  const userConfigLink = config?.id ? `${config.id}/edit` : '/new';
  const bookmarkLink = location;
  result.unshift({
    title: 'Edit UserConfig Page',
    links: [
      {
        label: 'Bookmark Page',
        href: `/UserConfiguration/${userConfigLink}?bookmark=${bookmarkLink.pathname}`,
        icon: <IconPlus />,
      },
    ],
  });

  result.push({
    title: 'Settings',
    links: [
      {
        label: 'Security',
        href: '/security',
        icon: <IconLock />,
      },
    ],
  });

  return result;
}

const resourceTypeToIcon: Record<string, Icon> = {
  Patient: IconStar,
  Practitioner: IconId,
  Organization: IconBuilding,
  ServiceRequest: IconReceipt,
  DiagnosticReport: IconReportMedical,
  Questionnaire: IconForms,
  admin: IconBrandAsana,
  AccessPolicy: IconLockAccess,
  Subscription: IconWebhook,
  batch: IconPackages,
  Observation: IconMicroscope,
};

function getIcon(to: string): JSX.Element | undefined {
  try {
    const resourceType = new URL(to, 'https://app.medplum.com').pathname.split('/')[1];
    if (resourceType in resourceTypeToIcon) {
      const Icon = resourceTypeToIcon[resourceType];
      return <Icon />;
    }
  } catch (e) {
    // Ignore
  }
  return <Space w={30} />;
}
