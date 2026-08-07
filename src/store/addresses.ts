"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address } from "@/types";

type AddressInput = Omit<Address, "id" | "userId">;

interface AddressState {
  addresses: Address[];
  add: (input: AddressInput) => Address;
  update: (id: string, input: AddressInput) => void;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
}

export const useAddresses = create<AddressState>()(
  persist(
    (set) => ({
      addresses: [],
      add: (input) => {
        const address: Address = {
          ...input,
          id: `addr_${Date.now()}`,
          userId: "local",
        };
        set((state) => {
          const first = state.addresses.length === 0;
          const addresses = input.isDefault
            ? state.addresses.map((a) => ({ ...a, isDefault: false }))
            : state.addresses;
          return {
            addresses: [
              ...addresses,
              { ...address, isDefault: input.isDefault || first },
            ],
          };
        });
        return address;
      },
      update: (id, input) =>
        set((state) => ({
          addresses: state.addresses.map((a) =>
            a.id === id ? { ...a, ...input } : input.isDefault ? { ...a, isDefault: false } : a
          ),
        })),
      remove: (id) =>
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        })),
      setDefault: (id) =>
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        })),
    }),
    { name: "credobuy-addresses" }
  )
);
