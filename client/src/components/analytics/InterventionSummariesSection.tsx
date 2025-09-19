import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';

type Summary = {
  id: string;
  week_start: string;
  week_end: string;
  intervention_type: string;
  conversation_count: number;
  key_points: string[];
  recommendations: string[];
  limitations: string[];
  created_at?: string;
};

interface Props {
  summaries: Summary[] | null | undefined;
  analyses?: any[];
  messages?: any[];
  goals?: any[];
}

const InterventionSummariesSection: React.FC<Props> = ({ summaries }) => {
  const items = Array.isArray(summaries) ? summaries : [];

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Weekly Intervention Summaries
        </CardTitle>
        <Badge variant="secondary">{items.length} week{items.length === 1 ? '' : 's'}</Badge>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No intervention summaries available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((s) => (
              <div key={s.id} className="p-4 border rounded-lg bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="font-semibold">
                    {new Date(s.week_start).toLocaleDateString()} — {new Date(s.week_end).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="capitalize">{s.intervention_type.replace(/_/g, ' ')}</Badge>
                    <Badge variant="outline">{s.conversation_count} conv.</Badge>
                  </div>
                </div>

                {s.key_points?.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-700">Key points</div>
                    <ul className="list-disc ml-6 text-sm text-gray-700">
                      {s.key_points.map((kp, i) => (
                        <li key={i}>{kp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {s.recommendations?.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700">Recommendations</div>
                    <ul className="list-disc ml-6 text-sm text-gray-700">
                      {s.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {s.limitations?.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700">Limitations</div>
                    <ul className="list-disc ml-6 text-sm text-gray-700">
                      {s.limitations.map((l, i) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InterventionSummariesSection;