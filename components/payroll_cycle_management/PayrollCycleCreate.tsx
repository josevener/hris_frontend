import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";

export function PayrollCycleCreate({ onCreate, isCreating }: { onCreate: (data: any) => void, isCreating: boolean }) {
  const [formData, setFormData] = useState({
    start_year_month: "",
    first_start_day: "",
    first_end_day: "",
    second_start_day: "",
    second_end_day: "",
    pay_date_offset: "",
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="start_year_month">Start Year-Month</Label>
        <Input
          id="start_year_month"
          type="month"
          value={formData.start_year_month}
          onChange={(e) => setFormData({ ...formData, start_year_month: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="pay_date_offset">Pay Date Offset</Label>
        <Input
          id="pay_date_offset"
          type="number"
          placeholder="Days before payday"
          value={formData.pay_date_offset}
          onChange={(e) => setFormData({ ...formData, pay_date_offset: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="first_start_day">First Cycle Start Day</Label>
        <Input
          id="first_start_day"
          type="number"
          placeholder="e.g., 1"
          value={formData.first_start_day}
          onChange={(e) => setFormData({ ...formData, first_start_day: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="first_end_day">First Cycle End Day</Label>
        <Input
          id="first_end_day"
          type="number"
          placeholder="e.g., 15"
          value={formData.first_end_day}
          onChange={(e) => setFormData({ ...formData, first_end_day: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="second_start_day">Second Cycle Start Day</Label>
        <Input
          id="second_start_day"
          type="number"
          placeholder="e.g., 16"
          value={formData.second_start_day}
          onChange={(e) => setFormData({ ...formData, second_start_day: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="second_end_day">Second Cycle End Day</Label>
        <Input
          id="second_end_day"
          type="number"
          placeholder="e.g., 30"
          value={formData.second_end_day}
          onChange={(e) => setFormData({ ...formData, second_end_day: e.target.value })}
        />
      </div>
      <div className="col-span-2 flex justify-end">
        <Button onClick={() => onCreate(formData)} disabled={isCreating}>
          {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create"}
        </Button>
      </div>
    </div>
  );
}
