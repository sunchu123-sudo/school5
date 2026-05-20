import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { schoolInfo } from "@/data/mock";
import { showAdminPlaceholder } from "@/lib/admin-ui";

export default function AdminSchoolInfo() {
  const [name, setName] = useState(schoolInfo.name);
  const [phone, setPhone] = useState(schoolInfo.phone);
  const [address, setAddress] = useState(schoolInfo.address);
  const [officeHours, setOfficeHours] = useState(schoolInfo.officeHours);
  const [email, setEmail] = useState(schoolInfo.email);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">學校資料</h2>
        <p className="mt-1 text-sm text-muted-foreground">編輯學校基本聯絡資訊</p>
      </div>

      <form
        className="card-base space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          showAdminPlaceholder("儲存學校資料");
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">學校名稱</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">電話</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">地址</Label>
          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="officeHours">上班時間</Label>
          <Input
            id="officeHours"
            value={officeHours}
            onChange={(e) => setOfficeHours(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <Button type="submit" className="w-full rounded-xl">
          <Save className="h-4 w-4" />
          儲存學校資料
        </Button>
        <p className="text-center text-xs text-muted-foreground">儲存按鈕僅顯示提示，不會寫入資料</p>
      </form>
    </div>
  );
}
