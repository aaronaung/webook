type SlotOverridesProps = {
  scheduleId: string;
};
export default function SlotOverrides({ scheduleId }: SlotOverridesProps) {
  return (
    <div className="col-span-1">
      <p className="font-medium text-muted-foreground">Date specific hours</p>
      <p className="text-sm text-muted-foreground">
        Override your availability for particular dates when your hours deviate
        from your usual weekly schedule.
      </p>
      {scheduleId}
    </div>
  );
}
