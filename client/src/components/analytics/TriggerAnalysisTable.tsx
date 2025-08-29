
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Brain, AlertTriangle, Target, Lightbulb } from 'lucide-react';

interface TriggerData {
  trigger: string;
  count: number;
  avgSeverity: number;
  color: string;
  category: string;
  description: string;
  whyExplanation: string;
  relatedTriggers?: string[];
}

interface TriggerAnalysisTableProps {
  triggerData: TriggerData[];
  totalEntries: number;
}

const TriggerAnalysisTable: React.FC<TriggerAnalysisTableProps> = ({
  triggerData,
  totalEntries
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  if (!triggerData || triggerData.length === 0) {
    return null;
  }

  const toggleRow = (trigger: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(trigger)) {
      newExpanded.delete(trigger);
    } else {
      newExpanded.add(trigger);
    }
    setExpandedRows(newExpanded);
  };

  const parseWhyExplanation = (explanation: string) => {
    const sections = {
      underlying: '',
      patterns: '',
      cognitive: '',
      recommendations: ''
    };

    // Parse the structured explanation
    const lines = explanation.split('\n').filter(line => line.trim());
    let currentSection = '';

    lines.forEach(line => {
      if (line.includes('UNDERLYING FACTORS:') || line.includes('Underlying psychological factors:')) {
        currentSection = 'underlying';
      } else if (line.includes('PATTERNS:') || line.includes('Escalation patterns:')) {
        currentSection = 'patterns';
      } else if (line.includes('COGNITIVE:') || line.includes('Cognitive distortions:')) {
        currentSection = 'cognitive';
      } else if (line.includes('RECOMMENDATIONS:') || line.includes('Therapeutic recommendations:')) {
        currentSection = 'recommendations';
      } else if (currentSection && line.trim() && !line.includes(':')) {
        sections[currentSection as keyof typeof sections] += line.trim() + ' ';
      }
    });

    return sections;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-blue-50/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Brain className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Clinical Trigger Analysis</h3>
          <p className="text-sm text-gray-600">Deep psychological insights into anxiety patterns</p>
        </div>
      </div>

      <div className="space-y-4">
        {triggerData
          .sort((a, b) => b.count - a.count)
          .map((trigger) => {
            const isExpanded = expandedRows.has(trigger.trigger);
            const sections = parseWhyExplanation(trigger.whyExplanation);
            const riskLevel = trigger.avgSeverity >= 7 ? 'high' : trigger.avgSeverity >= 5 ? 'moderate' : 'low';
            
            return (
              <Card key={trigger.trigger} className="border border-gray-200 hover:shadow-md transition-all duration-200">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <div 
                      className="w-full p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                      onClick={() => toggleRow(trigger.trigger)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Trigger Info */}
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full border-2 border-white shadow-md" 
                              style={{ backgroundColor: trigger.color }}
                            />
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">{trigger.trigger}</h4>
                              <p className="text-sm text-gray-600">{trigger.description}</p>
                            </div>
                          </div>

                          {/* Metrics */}
                          <div className="flex items-center gap-6 ml-auto mr-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{trigger.count}</div>
                              <div className="text-xs text-gray-500">episodes</div>
                            </div>
                            
                            <div className="text-center">
                              <div className={`text-2xl font-bold ${
                                riskLevel === 'high' ? 'text-red-600' : 
                                riskLevel === 'moderate' ? 'text-orange-600' : 'text-green-600'
                              }`}>
                                {(trigger?.avgSeverity !== null && trigger?.avgSeverity !== undefined && !isNaN(Number(trigger.avgSeverity)) ? Number(trigger.avgSeverity).toFixed(1) : '0.0')}
                              </div>
                              <div className="text-xs text-gray-500">severity</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {(trigger?.count !== null && trigger?.count !== undefined && totalEntries !== null && totalEntries !== undefined && totalEntries > 0 && !isNaN(Number(trigger.count))) ? ((Number(trigger.count) / Number(totalEntries)) * 100).toFixed(0) : '0'}%
                              </div>
                              <div className="text-xs text-gray-500">frequency</div>
                            </div>

                            <Badge variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'moderate' ? 'secondary' : 'outline'}>
                              {riskLevel} risk
                            </Badge>
                          </div>
                        </div>

                        {/* Expand Icon */}
                        <div className="flex items-center">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
                      <div className="pt-4 space-y-4">
                        {/* Clinical Insights Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Underlying Factors */}
                          {sections.underlying && (
                            <Card className="p-4 bg-white border-l-4 border-l-blue-500">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                  <Brain className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-2">Underlying Psychology</h5>
                                  <p className="text-sm text-gray-700 leading-relaxed">{sections.underlying}</p>
                                </div>
                              </div>
                            </Card>
                          )}

                          {/* Cognitive Patterns */}
                          {sections.cognitive && (
                            <Card className="p-4 bg-white border-l-4 border-l-orange-500">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-50 rounded-lg">
                                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-2">Cognitive Distortions</h5>
                                  <p className="text-sm text-gray-700 leading-relaxed">{sections.cognitive}</p>
                                </div>
                              </div>
                            </Card>
                          )}

                          {/* Escalation Patterns */}
                          {sections.patterns && (
                            <Card className="p-4 bg-white border-l-4 border-l-purple-500">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                  <Target className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-2">Escalation Patterns</h5>
                                  <p className="text-sm text-gray-700 leading-relaxed">{sections.patterns}</p>
                                </div>
                              </div>
                            </Card>
                          )}

                          {/* Treatment Recommendations */}
                          {sections.recommendations && (
                            <Card className="p-4 bg-white border-l-4 border-l-green-500">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-50 rounded-lg">
                                  <Lightbulb className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-2">Treatment Focus</h5>
                                  <p className="text-sm text-gray-700 leading-relaxed">{sections.recommendations}</p>
                                </div>
                              </div>
                            </Card>
                          )}
                        </div>

                        {/* Related Triggers */}
                        {trigger.relatedTriggers && trigger.relatedTriggers.length > 0 && (
                          <Card className="p-4 bg-white">
                            <h5 className="font-semibold text-gray-900 mb-3">Why Client Struggles with Related Triggers</h5>
                            <div className="space-y-3">
                              {trigger.relatedTriggers.slice(0, 6).map((related, index) => {
                                // Generate clinical explanation for why this trigger affects the client
                                const getWhyExplanation = (triggerName: string) => {
                                  const explanations = {
                                    // Self-esteem and identity
                                    'self-worth concerns': 'Client may have underlying self-esteem issues and perfectionist tendencies, leading to constant self-evaluation and fear of not being "good enough"',
                                    'body image': 'Distorted self-perception often linked to societal standards, past criticism, or underlying depression affecting self-acceptance',
                                    'imposter syndrome': 'Deep-seated feelings of inadequacy despite evidence of competence, often stemming from perfectionism or childhood messaging',
                                    'identity crisis': 'Uncertainty about personal values, goals, or sense of self, often triggered during life transitions or major changes',
                                    
                                    // Social and interpersonal
                                    'social interactions': 'Social anxiety likely stems from fear of judgment, past negative social experiences, or underlying insecurity about social competence',
                                    'public speaking': 'Speaking anxiety typically relates to fear of judgment, perfectionism, or past negative experiences with public exposure',
                                    'crowds': 'Crowd anxiety may stem from feeling overwhelmed, loss of control, or past traumatic experiences in crowded spaces',
                                    'authority figures': 'Authority anxiety may relate to past negative experiences with power dynamics or fear of judgment from those in control',
                                    'conflict': 'Conflict avoidance may stem from childhood experiences, fear of abandonment, or difficulty with assertiveness and boundaries',
                                    'rejection': 'Fear of rejection often relates to attachment trauma, low self-worth, or past experiences of abandonment or criticism',
                                    'criticism': 'Hypersensitivity to criticism may indicate perfectionism, low self-esteem, or past emotional abuse or harsh criticism',
                                    'embarrassment': 'Fear of embarrassment often stems from social anxiety, perfectionism, or past experiences of public humiliation',
                                    'loneliness': 'Chronic loneliness may reflect attachment issues, social skills deficits, or underlying depression affecting relationship formation',
                                    
                                    // Romantic and intimate relationships
                                    'attractive women': 'May reflect social anxiety, fear of rejection, self-esteem issues, or difficulty with interpersonal relationships and social confidence',
                                    'attractive men': 'May reflect social anxiety, fear of rejection, self-esteem issues, or difficulty with interpersonal relationships and social confidence',
                                    'dating': 'Dating anxiety often involves fear of rejection, concerns about self-worth, or anxiety about intimacy and vulnerability',
                                    'intimacy': 'Intimacy fears may stem from past relationship trauma, attachment issues, or fear of emotional vulnerability',
                                    'relationship problems': 'Relationship stress often reflects attachment issues, communication patterns, or fear of abandonment/intimacy',
                                    'breakups': 'Breakup anxiety may involve abandonment fears, identity loss, or difficulty coping with major life changes',
                                    'jealousy': 'Jealousy often stems from insecurity, past betrayal trauma, or fear of abandonment and loss of love',
                                    
                                    // Academic and professional
                                    'academic pressure': 'Educational stress may stem from perfectionism, fear of disappointing others, or linking self-worth to academic achievement',
                                    'job interviews': 'Interview anxiety often involves fear of rejection, imposter syndrome, or catastrophic thinking about future consequences',
                                    'work stress': 'Job-related anxiety often involves fear of failure, imposter syndrome, or conflict between personal values and work demands',
                                    'performance evaluations': 'Evaluation anxiety often involves imposter syndrome, perfectionism, or fear that others will discover perceived inadequacies',
                                    'deadlines': 'Time pressure anxiety often relates to perfectionism, fear of failure, or difficulty with time management and prioritization',
                                    'unemployment': 'Job loss anxiety involves financial security fears, identity loss, and concerns about self-worth and future stability',
                                    'workplace conflict': 'Professional conflict may trigger past authority issues, fear of job loss, or difficulty with assertiveness',
                                    'presentations': 'Presentation anxiety combines performance fears with social anxiety and perfectionist expectations',
                                    'exams': 'Test anxiety often involves perfectionism, fear of failure, and catastrophic thinking about future consequences',
                                    'high-stakes testing': 'Performance anxiety and fear of failure, possibly linked to family expectations or personal academic identity and future goals',
                                    
                                    // Family and childhood
                                    'family issues': 'Family-related stress may involve boundary issues, unresolved trauma, or feeling responsible for others\' wellbeing',
                                    'childhood trauma': 'Past trauma may create hypervigilance, emotional dysregulation, and difficulty with trust and relationships',
                                    'parental expectations': 'Family pressure often creates perfectionism, fear of disappointment, and difficulty establishing independent identity',
                                    'sibling rivalry': 'Competitive family dynamics may create ongoing insecurity about worth and love within relationships',
                                    'divorce': 'Family dissolution may trigger abandonment fears, loyalty conflicts, and anxiety about relationship stability',
                                    'parenting': 'Parental anxiety often involves perfectionism, fear of harming children, and overwhelming responsibility for another\'s wellbeing',
                                    
                                    // Health and body
                                    'health worries': 'Health anxiety may involve catastrophic thinking patterns and fear of loss of control over one\'s body and future',
                                    'medical appointments': 'Medical anxiety may involve fear of bad news, loss of control over health, or past traumatic medical experiences',
                                    'illness': 'Illness anxiety often involves fear of death, loss of control, and catastrophic thinking about symptoms',
                                    'pain': 'Chronic pain may create anxiety about future suffering, loss of function, and impact on life quality',
                                    'aging': 'Aging anxiety often involves fear of death, loss of independence, and concerns about declining abilities',
                                    'death': 'Death anxiety may stem from existential fears, loss of control, or unresolved grief and trauma',
                                    
                                    // Financial and security
                                    'financial concerns': 'Money worries often trigger deeper fears about security, self-worth, or ability to provide for oneself/family',
                                    'debt': 'Financial debt may create shame, fear of future consequences, and anxiety about meeting basic needs',
                                    'poverty': 'Economic insecurity often triggers survival fears and concerns about basic safety and wellbeing',
                                    'housing': 'Housing instability may activate deep fears about safety, security, and basic survival needs',
                                    
                                    // Legal and immigration
                                    'immigration consequences': 'Fear of deportation or legal issues creates chronic stress about future security, often stemming from past trauma or uncertainty about legal status',
                                    'legal issues': 'Legal problems may trigger fears about consequences, loss of freedom, and concerns about future security',
                                    'police': 'Authority anxiety combined with fears about consequences, often influenced by past experiences or social messaging',
                                    
                                    // Technology and modern life
                                    'technical difficulties': 'Frustration with technology may reflect broader feelings of inadequacy or fear of being left behind in a digital world',
                                    'social media': 'Digital platforms may trigger comparison anxiety, FOMO, or feelings of inadequacy when comparing to others\' curated lives',
                                    'online harassment': 'Digital abuse may create hypervigilance, social withdrawal, and fear of online participation',
                                    'cyber security': 'Digital security fears may reflect broader anxiety about privacy, control, and protection of personal information',
                                    
                                    // Environmental and situational
                                    'driving': 'Driving anxiety often relates to fear of losing control, responsibility for others\' safety, or past traumatic driving experiences',
                                    'flying': 'Flight anxiety may involve claustrophobia, fear of death, or need for control in unpredictable situations',
                                    'heights': 'Height anxiety often involves fear of falling, loss of control, and catastrophic thinking about danger',
                                    'enclosed spaces': 'Claustrophobia may stem from past trauma, fear of being trapped, or need for escape routes',
                                    'storms': 'Weather anxiety may relate to fear of natural disasters, loss of control, or past traumatic experiences',
                                    'darkness': 'Fear of darkness often involves childhood fears, vulnerability concerns, or past traumatic experiences',
                                    
                                    // Existential and spiritual
                                    'uncertainty': 'Intolerance of uncertainty often stems from need for control, perfectionism, or past experiences of unpredictable trauma',
                                    'future': 'Future anxiety may involve catastrophic thinking, need for control, or fear of unknown outcomes',
                                    'change': 'Change resistance often stems from fear of loss, need for predictability, or past negative experiences with transitions',
                                    'meaning': 'Existential anxiety about life purpose may reflect depression, identity issues, or spiritual questioning',
                                    
                                    // Specific phobias
                                    'animals': 'Animal phobias may stem from past negative experiences, evolutionary fears, or learned anxiety from family members',
                                    'needles': 'Medical phobias often involve past traumatic medical experiences, fear of pain, or loss of control',
                                    'blood': 'Blood phobia may relate to fear of injury, death, or loss of control over bodily integrity',
                                    'vomiting': 'Emetophobia often involves fear of loss of control, public embarrassment, or past traumatic illness experiences',
                                    
                                    // Catch-all categories
                                    'current situation': 'Present-moment stressors feel overwhelming, possibly due to limited coping mechanisms or accumulated stress from multiple life areas',
                                    'unspecified - needs exploration': 'Vague or unclear triggers suggest potential avoidance patterns or difficulty identifying specific stressors, requiring deeper therapeutic exploration',
                                    'general anxiety': 'Non-specific anxiety may indicate underlying generalized anxiety disorder or difficulty identifying specific triggers',
                                    'panic attacks': 'Panic episodes often involve fear of fear itself, creating cycles of anticipatory anxiety and avoidance behaviors'
                                  };
                                  
                                  return explanations[triggerName.toLowerCase() as keyof typeof explanations] || `This trigger pattern suggests areas for therapeutic exploration and may involve underlying anxiety responses that would benefit from clinical assessment`;
                                };

                                return (
                                  <div key={index} className="flex flex-col gap-2">
                                    <Badge variant="outline" className="text-xs w-fit font-medium">
                                      {related}
                                    </Badge>
                                    <p className="text-xs text-gray-600 leading-relaxed pl-2 border-l-2 border-gray-200">
                                      {getWhyExplanation(related)}
                                    </p>
                                  </div>
                                );
                              })}
                              {trigger.relatedTriggers.length > 6 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{trigger.relatedTriggers.length - 6} more triggers requiring analysis
                                </Badge>
                              )}
                            </div>
                          </Card>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
      </div>
    </Card>
  );
};

export default TriggerAnalysisTable;
