import type { DeepEvalFinding, EvaluationScore } from "@/lib/types";
import { Badge } from "@/components/ui";

function pct(v: number) {
  return `${Math.round(v * 100)}%`;
}

export function EvaluationResultsTables({
  evaluationScores,
  deepEvalFindings,
}: {
  evaluationScores: EvaluationScore[];
  deepEvalFindings: DeepEvalFinding[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 text-sm font-semibold text-muted">RAGAS Quality Scores (by review round)</div>
        {evaluationScores.length === 0 ? (
          <p className="text-sm text-muted">No RAGAS scores recorded.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr className="text-left">
                  <Th>Round</Th>
                  <Th>Faithfulness</Th>
                  <Th>Answer Relevancy</Th>
                  <Th>Context Precision</Th>
                  <Th>Context Recall</Th>
                  <Th>Context Relevancy</Th>
                  <Th>Overall</Th>
                  <Th>Passed Threshold</Th>
                </tr>
              </thead>
              <tbody>
                {evaluationScores.map((s) => (
                  <tr key={s.round_number} className="border-t border-border">
                    <Td>{s.round_number}</Td>
                    <Td>{pct(s.faithfulness)}</Td>
                    <Td>{pct(s.answer_relevancy)}</Td>
                    <Td>{pct(s.context_precision)}</Td>
                    <Td>{pct(s.context_recall)}</Td>
                    <Td>{pct(s.context_relevancy)}</Td>
                    <Td className="font-semibold">{pct(s.overall_score)}</Td>
                    <Td>
                      <Badge color={s.passed_threshold ? "green" : "red"}>
                        {s.passed_threshold ? "Passed" : "Below Threshold"}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-muted">
          Deep Evaluation Findings (grounding &amp; numeric sanity checks)
        </div>
        {deepEvalFindings.length === 0 ? (
          <p className="text-sm text-muted">No deep evaluation findings — nothing flagged.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr className="text-left">
                  <Th>Round</Th>
                  <Th>Severity</Th>
                  <Th>Recommendation</Th>
                  <Th>Issue</Th>
                </tr>
              </thead>
              <tbody>
                {deepEvalFindings.map((f, i) => (
                  <tr key={i} className="border-t border-border align-top">
                    <Td>{f.round_number}</Td>
                    <Td>
                      <Badge color={f.severity === "error" ? "red" : "amber"}>{f.severity}</Badge>
                    </Td>
                    <Td>{f.recommendation_title}</Td>
                    <Td>{f.issue}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 font-semibold text-muted">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
