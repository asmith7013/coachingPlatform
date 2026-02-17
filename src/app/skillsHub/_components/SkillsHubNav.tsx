"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Group,
  Menu,
  Burger,
  Drawer,
  UnstyledButton,
  Stack,
  Text,
  Divider,
  Accordion,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconChevronDown,
  IconMap,
  IconClipboardCheck,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";
import { useAuthenticatedUser } from "@/hooks/auth/useAuthenticatedUser";

type NavItem = { href: string; label: string };

type NavCategory = {
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
  adminOnly?: boolean;
};

export function SkillsHubNav() {
  const pathname = usePathname();
  const { hasRole } = useAuthenticatedUser();
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isSuperAdmin = hasRole("super_admin");
  const isDirector = hasRole("director");
  const isAdmin = isSuperAdmin || isDirector;

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const categories: NavCategory[] = [
    {
      label: "Skills",
      icon: <IconMap size={18} />,
      items: [{ href: "/skillsHub", label: "Hub" }],
    },
    {
      label: "Coaching",
      icon: <IconClipboardCheck size={18} />,
      items: [{ href: "/skillsHub/caseload", label: "My Caseload" }],
    },
    {
      label: "Admin",
      icon: <IconSettings size={18} />,
      items: [{ href: "/skillsHub/admin/assignments", label: "Assignments" }],
      adminOnly: true,
    },
  ];

  const visibleCategories = categories.filter((c) => !c.adminOnly || isAdmin);

  const isActiveCategory = (category: NavCategory) => {
    return category.items.some(
      (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
    );
  };

  const isActiveItem = (item: NavItem) => {
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{ backgroundColor: "#111827" }}
    >
      <div className="mx-auto px-4 lg:px-6 py-3" style={{ maxWidth: "1600px" }}>
        <Group justify="space-between">
          {/* Mobile burger */}
          <Box hiddenFrom="md">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              size="sm"
              color="white"
            />
          </Box>

          {/* Desktop nav */}
          <Group gap="xs" visibleFrom="md">
            {visibleCategories.map((category) => {
              const active = isActiveCategory(category);

              if (category.items.length === 1) {
                const item = category.items[0];
                return (
                  <UnstyledButton
                    key={category.label}
                    component={Link}
                    href={item.href}
                    px="md"
                    py="xs"
                    style={{
                      borderRadius: "6px",
                      color: active ? "white" : "#d1d5db",
                      backgroundColor: active
                        ? "rgba(255,255,255,0.1)"
                        : "transparent",
                      fontWeight: 500,
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {category.icon}
                    {category.label}
                  </UnstyledButton>
                );
              }

              return (
                <Menu
                  key={category.label}
                  trigger="click"
                  shadow="md"
                  width={220}
                  position="bottom-start"
                  offset={4}
                >
                  <Menu.Target>
                    <UnstyledButton
                      px="md"
                      py="xs"
                      style={{
                        borderRadius: "6px",
                        color: active ? "white" : "#d1d5db",
                        backgroundColor: active
                          ? "rgba(255,255,255,0.1)"
                          : "transparent",
                        fontWeight: 500,
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {category.icon}
                      {category.label}
                      <IconChevronDown size={14} />
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {category.items.map((item) => (
                      <Menu.Item
                        key={item.href}
                        component={Link}
                        href={item.href}
                        style={{
                          backgroundColor: isActiveItem(item)
                            ? "var(--mantine-color-teal-0)"
                            : undefined,
                          color: isActiveItem(item)
                            ? "var(--mantine-color-teal-7)"
                            : undefined,
                          fontWeight: isActiveItem(item) ? 600 : undefined,
                        }}
                      >
                        {item.label}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              );
            })}
          </Group>

          {/* Right side: Sign out */}
          <Group gap="xs">
            <UnstyledButton
              component={Link}
              href="/sign-out"
              px="md"
              py="xs"
              style={{
                borderRadius: "6px",
                color: "white",
                backgroundColor: "rgba(255,255,255,0.1)",
                fontWeight: 500,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <IconLogout size={16} />
              <Text component="span" size="sm" visibleFrom="md">
                Sign Out
              </Text>
            </UnstyledButton>
          </Group>
        </Group>
      </div>

      {/* Mobile drawer */}
      <Drawer
        opened={mobileOpened}
        onClose={closeMobile}
        size="xs"
        title={
          <Text fw={700} size="lg">
            Skills Hub
          </Text>
        }
        styles={{
          body: { padding: "0 16px 16px" },
        }}
      >
        <Stack gap="xs">
          {visibleCategories.map((category) => (
            <div key={category.label}>
              {category.items.length === 1 ? (
                <UnstyledButton
                  component={Link}
                  href={category.items[0].href}
                  onClick={closeMobile}
                  px="md"
                  py="sm"
                  style={{
                    borderRadius: "6px",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: isActiveCategory(category)
                      ? "var(--mantine-color-teal-0)"
                      : undefined,
                    color: isActiveCategory(category)
                      ? "var(--mantine-color-teal-7)"
                      : undefined,
                    fontWeight: isActiveCategory(category) ? 600 : 400,
                  }}
                >
                  {category.icon}
                  {category.label}
                </UnstyledButton>
              ) : (
                <Accordion variant="filled">
                  <Accordion.Item value={category.label}>
                    <Accordion.Control
                      icon={category.icon}
                      style={{
                        fontWeight: isActiveCategory(category) ? 600 : 400,
                      }}
                    >
                      {category.label}
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap={4}>
                        {category.items.map((item) => (
                          <UnstyledButton
                            key={item.href}
                            component={Link}
                            href={item.href}
                            onClick={closeMobile}
                            px="md"
                            py="xs"
                            style={{
                              borderRadius: "4px",
                              fontSize: "14px",
                              backgroundColor: isActiveItem(item)
                                ? "var(--mantine-color-teal-0)"
                                : undefined,
                              color: isActiveItem(item)
                                ? "var(--mantine-color-teal-7)"
                                : undefined,
                              fontWeight: isActiveItem(item) ? 600 : 400,
                            }}
                          >
                            {item.label}
                          </UnstyledButton>
                        ))}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              )}
            </div>
          ))}
          <Divider my="xs" />
          <UnstyledButton
            component={Link}
            href="/sign-out"
            onClick={closeMobile}
            px="md"
            py="sm"
            style={{
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <IconLogout size={18} />
            Sign Out
          </UnstyledButton>
        </Stack>
      </Drawer>
    </nav>
  );
}
