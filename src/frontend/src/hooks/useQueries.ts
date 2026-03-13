import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Position } from "../backend.d";
import { getAdminToken, getToken } from "../utils/format";
import { useActor } from "./useActor";

export function useUserDashboard() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const token = getToken();
      if (!actor || !token) return null;
      return actor.getUserDashboard(token);
    },
    enabled: !!actor && !isFetching && !!getToken(),
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const token = getToken();
      if (!actor || !token) return null;
      return actor.getUserProfileById(token);
    },
    enabled: !!actor && !isFetching && !!getToken(),
  });
}

export function useIncomeRecords() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["income"],
    queryFn: async () => {
      const token = getToken();
      if (!actor || !token) return [];
      return actor.getUserIncomeRecords(token);
    },
    enabled: !!actor && !isFetching && !!getToken(),
  });
}

export function useWalletHistory() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const token = getToken();
      if (!actor || !token) return [];
      return actor.getUserWalletHistory(token);
    },
    enabled: !!actor && !isFetching && !!getToken(),
  });
}

export function usePlans() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPlans();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBinaryTree(userId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tree", userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getBinaryTree(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useWithdrawRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      const token = getToken();
      if (!actor || !token) throw new Error("Not logged in");
      return actor.withdrawRequest(token, BigInt(amount));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ fullName }: { fullName: string }) => {
      const token = getToken();
      if (!actor || !token) throw new Error("Not logged in");
      return actor.updateUserProfile(token, fullName);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useSubmitPayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      planId,
      upiRef,
    }: { planId: bigint; upiRef: string }) => {
      const token = getToken();
      if (!actor || !token) throw new Error("Not logged in");
      return actor.submitPayment(token, planId, upiRef);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

// Admin queries
export function useAdminTotalBusiness() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["admin", "business"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.adminGetTotalBusiness();
    },
    enabled: !!actor && !isFetching && !!getAdminToken(),
  });
}

export function useAdminUserList() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminUserList();
    },
    enabled: !!actor && !isFetching && !!getAdminToken(),
  });
}

export function useAdminPayments() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["admin", "payments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetPayments();
    },
    enabled: !!actor && !isFetching && !!getAdminToken(),
  });
}

export function useAdminProducts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetProducts();
    },
    enabled: !!actor && !isFetching && !!getAdminToken(),
  });
}

export function useAdminPendingRegistrations() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["admin", "registrations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetPendingRegistrations();
    },
    enabled: !!actor && !isFetching && !!getAdminToken(),
  });
}

export function useAdminActivateUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      isActive,
    }: { userId: string; isActive: boolean }) => {
      if (!actor) throw new Error("No actor");
      return actor.adminActivateUser(userId, isActive);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useAdminVerifyPayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentId,
      verified,
    }: { paymentId: bigint; verified: boolean }) => {
      if (!actor) throw new Error("No actor");
      return actor.adminVerifyPayment(paymentId, verified);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "payments"] }),
  });
}

export function useAdminApproveRegistration() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      approved,
    }: { userId: string; approved: boolean }) => {
      if (!actor) throw new Error("No actor");
      return actor.adminApproveRegistration(userId, approved);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "registrations"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminApproveWithdraw() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ txId, approved }: { txId: bigint; approved: boolean }) => {
      if (!actor) throw new Error("No actor");
      return actor.adminApproveWithdraw(txId, approved);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      description,
      price,
      imageUrl,
    }: {
      name: string;
      description: string;
      price: bigint;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addProduct(name, description, price, imageUrl);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      name,
      description,
      price,
      imageUrl,
      isActive,
    }: {
      productId: bigint;
      name: string;
      description: string;
      price: bigint;
      imageUrl: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateProduct(
        productId,
        name,
        description,
        price,
        imageUrl,
        isActive,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export function useAddBinaryPosition() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: ({
      userId,
      parentId,
      position,
    }: { userId: string; parentId: string; position: Position }) => {
      if (!actor) throw new Error("No actor");
      return actor.addUserBinaryPosition(userId, parentId, position);
    },
  });
}

export function useAdminUpdateUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      fullName,
      mobile,
    }: { userId: string; fullName: string; mobile: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.adminUpdateUser(userId, fullName, mobile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useAdminDeleteUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.adminDeleteUser(userId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}
