import { NextRequest, NextResponse } from "next/server";
import { mockUserProfiles } from "@/lib/mockData";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json() as { username?: string; password?: string };

    if (!username || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên đăng nhập và mật khẩu" },
        { status: 400 }
      );
    }

    // Use mock users from mockData.ts
    const mockUser = mockUserProfiles.find(u => u.username === username && u.password === password);
    
    // Map position to role
    const roleMap: Record<string, string> = {
      "Quản trị viên": "Admin",
      "Giám đốc": "Giám đốc",
      "Trưởng phòng xét nghiệm": "Trưởng phòng xét nghiệm",
      "Trưởng nhóm": "Trưởng nhóm",
      "Kỹ thuật viên": "Kỹ thuật viên",
      "Quản lý chất lượng": "Quản lý chất lượng",
      "Quản lý trang thiết bị": "Quản lý trang thiết bị",
    };

    if (mockUser) {
      return NextResponse.json({
        user: {
          id: mockUser.id,
          username: mockUser.username,
          fullName: mockUser.fullName,
          role: roleMap[mockUser.position] || mockUser.position,
          department: mockUser.department,
          email: mockUser.email,
          phone: mockUser.phone,
          branch: mockUser.branch,
        }
      });
    }

    return NextResponse.json(
      { error: "Tên đăng nhập hoặc mật khẩu không đúng" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Lỗi hệ thống, vui lòng thử lại" },
      { status: 500 }
    );
  }
}
