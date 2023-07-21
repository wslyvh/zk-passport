import { Snap, SnapsResponse } from "@/types/snaps";

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');

export const defaultSnapOrigin =
  process.env.SNAP_ORIGIN ?? `local:http://localhost:8080`;

export const shouldDisplayReconnectButton = (installedSnap?: Snap) =>
  installedSnap && isLocalSnap(installedSnap?.id);

export async function isFlask() {
  const provider = window.ethereum;

  try {
    const clientVersion = await provider?.request({
      method: 'web3_clientVersion',
    });

    const isFlaskDetected = (clientVersion as string[])?.includes('flask');

    return Boolean(provider && isFlaskDetected);
  } catch {
    return false;
  }
}

export async function getSnaps() {
  return (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as SnapsResponse;
}

export async function connectSnap(
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
}

export async function getSnap(version?: string) {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
}
