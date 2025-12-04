// @ts-nocheck
"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";

function Menubar(props: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return <MenubarPrimitive.Root {...props} />;
}

function MenubarMenu(
  props: React.ComponentProps<typeof MenubarPrimitive.Menu>,
) {
  return <MenubarPrimitive.Menu {...props} />;
}

function MenubarTrigger(
  props: React.ComponentProps<typeof MenubarPrimitive.Trigger>,
) {
  return <MenubarPrimitive.Trigger {...props} />;
}

function MenubarContent(
  props: React.ComponentProps<typeof MenubarPrimitive.Content>,
) {
  return <MenubarPrimitive.Content {...props} />;
}

function MenubarItem(
  props: React.ComponentProps<typeof MenubarPrimitive.Item>,
) {
  return <MenubarPrimitive.Item {...props} />;
}

function MenubarSeparator(
  props: React.ComponentProps<typeof MenubarPrimitive.Separator>,
) {
  return <MenubarPrimitive.Separator {...props} />;
}

function MenubarSub(props: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub {...props} />;
}

function MenubarSubTrigger(
  props: React.ComponentProps<typeof MenubarPrimitive.SubTrigger>,
) {
  return <MenubarPrimitive.SubTrigger {...props} />;
}

function MenubarSubContent(
  props: React.ComponentProps<typeof MenubarPrimitive.SubContent>,
) {
  return <MenubarPrimitive.SubContent {...props} />;
}

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
