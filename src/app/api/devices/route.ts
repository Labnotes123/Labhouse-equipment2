import { NextRequest, NextResponse } from "next/server";
import { createDevice, listDevices } from "@/lib/device-store";
import {
  findUser,
  listScopePermissions,
  listInstallationLocations,
  listDepartments,
} from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const userId = searchParams.get("userId") || req.headers.get("x-user-id") || "";
    const profileId = searchParams.get("profileId") || req.headers.get("x-profile-id") || "";

    let result = [...listDevices(status)].sort((a, b) => b.code.localeCompare(a.code));

    const profileIds = profileId
      ? [profileId]
      : (userId ? (findUser(userId)?.profileIds || []) : []);

    if (profileIds.length > 0) {
      const scopes = listScopePermissions().filter((scope) => scope.isActive && profileIds.includes(scope.profileId));
      if (scopes.length === 0) {
        return NextResponse.json([]);
      }

      const allowedBranchIds = new Set(scopes.flatMap((scope) => scope.branchIds || []));
      const allowedDepartmentIds = new Set(scopes.flatMap((scope) => scope.departmentIds || []));
      const allowedDeviceIds = new Set(scopes.flatMap((scope) => scope.deviceIds || []));

      const installations = listInstallationLocations();
      const departments = listDepartments();

      result = result.filter((device) => {
        const installation = installations.find((it) =>
          it.id === device.installationLocation ||
          it.code === device.installationLocation ||
          it.name === device.installationLocation ||
          it.id === device.location ||
          it.code === device.location ||
          it.name === device.location
        );

        const bySpecialty = departments.find((dept) => dept.name === device.specialty);
        const departmentId = installation?.departmentId || bySpecialty?.id || "";
        const branchId = installation?.branchId || bySpecialty?.branchId || "";

        const branchOk = allowedBranchIds.size === 0 || (branchId && allowedBranchIds.has(branchId));
        const departmentOk = allowedDepartmentIds.size === 0 || (departmentId && allowedDepartmentIds.has(departmentId));
        const deviceOk = allowedDeviceIds.size === 0 || allowedDeviceIds.has(device.id);

        return branchOk && departmentOk && deviceOk;
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newDevice = createDevice(body);
    return NextResponse.json(newDevice, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
