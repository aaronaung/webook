import { Button } from "@/src/components/ui/button";
import { ServiceEvent } from "@/types";

type ServiceEventQuestionsProps = {
  event: ServiceEvent;
  onBack: () => void;
};
export default function ServiceEventQuestions({
  event,
  onBack,
}: ServiceEventQuestionsProps) {
  return (
    <div>
      <Button onClick={onBack}>Back</Button>
      {(event.service.questions || []).map((q) => {
        return <div key={q.id}>{q.question}</div>;
      })}
    </div>
  );
}
