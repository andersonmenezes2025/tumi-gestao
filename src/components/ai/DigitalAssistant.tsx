import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bot, Send, User, Minimize2, Maximize2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DigitalAssistantProps {
  trigger?: React.ReactNode;
}

export function DigitalAssistant({ trigger }: DigitalAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Olá! Sou seu assistente digital. Como posso ajudá-lo hoje? Posso auxiliar com informações sobre produtos, vendas, clientes e muito mais!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { company } = useCompany();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response (in real implementation, this would call N8N webhook)
    setTimeout(() => {
      const responses = [
        'Entendi sua solicitação. Deixe-me buscar essas informações para você.',
        'Claro! Posso ajudar com isso. Que tipo de informação específica você precisa?',
        'Baseado nos dados da sua empresa, aqui estão algumas sugestões...',
        'Vou processar essa informação e te enviar um relatório detalhado.',
        'Perfeito! Vou automatizar essa tarefa para você através do N8N.',
        'Entendo. Vou integrar isso com o WhatsApp para notificar seus clientes.',
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: randomResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    'Mostrar vendas do mês',
    'Produtos em baixo estoque',
    'Clientes mais ativos',
    'Relatório financeiro',
    'Automatizar follow-up',
  ];

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    handleSendMessage();
  };

  const DefaultTrigger = (
    <Button className="gap-2">
      <Bot className="h-4 w-4" />
      Assistente Digital
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || DefaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Assistente Digital - {company?.name}
            <Badge variant="outline" className="ml-2">Online</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 border rounded-lg">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground ml-4'
                        : 'bg-muted mr-4'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === 'assistant' && (
                        <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      {message.type === 'user' && (
                        <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg mr-4">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="p-2 border-t">
            <div className="flex flex-wrap gap-2 mb-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  className="text-xs"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="flex gap-2 p-2 border-t">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta ou solicitação..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Floating Assistant Button
export function FloatingAssistant() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DigitalAssistant
        trigger={
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        }
      />
    </div>
  );
}