#!/bin/bash

# Script de monitoramento em tempo real para o Sistema Tumi Gestão
# Uso: ./scripts/monitor.sh [opção]

# Configurações
APP_NAME="tumi-gestao-api"
API_URL="http://localhost:3001/api"

# Função para mostrar status colorido
show_status() {
    local status=$1
    local message=$2
    
    case $status in
        "ok"|"online"|"connected")
            echo "✅ $message"
            ;;
        "error"|"offline"|"stopped")
            echo "❌ $message"
            ;;
        "warning"|"starting")
            echo "⚠️  $message"
            ;;
        *)
            echo "ℹ️  $message"
            ;;
    esac
}

# Função para verificar API
check_api() {
    local endpoint=$1
    local name=$2
    
    if curl -s -f "$API_URL$endpoint" > /dev/null; then
        show_status "ok" "$name está respondendo"
        return 0
    else
        show_status "error" "$name não está respondendo"
        return 1
    fi
}

# Função para mostrar informações detalhadas da API
show_api_info() {
    echo "🔍 Informações detalhadas da API:"
    
    local health_data
    health_data=$(curl -s "$API_URL/health/detailed" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$health_data" ]; then
        echo "$health_data" | jq . 2>/dev/null || echo "$health_data"
    else
        echo "❌ Não foi possível obter informações detalhadas da API"
    fi
}

# Verificação rápida
quick_check() {
    echo "⚡ VERIFICAÇÃO RÁPIDA"
    echo "===================="
    
    # Status PM2
    if pm2 describe $APP_NAME > /dev/null 2>&1; then
        local pm2_status=$(pm2 jlist | jq -r ".[] | select(.name==\"$APP_NAME\") | .pm2_env.status" 2>/dev/null)
        show_status "$pm2_status" "PM2 Status: $pm2_status"
    else
        show_status "error" "Aplicação não encontrada no PM2"
    fi
    
    # Health checks
    check_api "/health" "API Health"
    check_api "/health/db" "Database Connection"
    
    # Status do Nginx
    if systemctl is-active nginx > /dev/null 2>&1; then
        show_status "ok" "Nginx está ativo"
    else
        show_status "error" "Nginx não está ativo"
    fi
    
    echo ""
}

# Monitoramento detalhado
detailed_monitor() {
    echo "📊 MONITORAMENTO DETALHADO"
    echo "=========================="
    
    # PM2 Status
    echo "🔧 PM2 Status:"
    pm2 status $APP_NAME
    echo ""
    
    # API Health detalhado
    show_api_info
    echo ""
    
    # Uso de recursos
    echo "💻 Uso de Recursos:"
    pm2 monit $APP_NAME --no-interaction & 
    local pm2_pid=$!
    sleep 3
    kill $pm2_pid 2>/dev/null || true
    echo ""
    
    # Últimos logs
    echo "📄 Últimos Logs (10 linhas):"
    pm2 logs $APP_NAME --lines 10 --nostream
    echo ""
    
    # Status do sistema
    echo "🖥️  Sistema:"
    echo "  - Uptime: $(uptime -p)"
    echo "  - Memória: $(free -h | grep '^Mem:' | awk '{print $3 "/" $2}')"
    echo "  - Disco: $(df -h / | tail -1 | awk '{print $5 " usado de " $2}')"
}

# Logs em tempo real
live_logs() {
    echo "📺 LOGS EM TEMPO REAL"
    echo "===================="
    echo "Pressione Ctrl+C para parar"
    echo ""
    
    # Combinar logs da aplicação e nginx
    tail -f \
        <(pm2 logs $APP_NAME --raw --timestamp) \
        <(sudo tail -f /var/log/nginx/access.log 2>/dev/null | sed 's/^/[nginx] /') \
        2>/dev/null
}

# Teste de carga simples
load_test() {
    echo "⚡ TESTE DE CARGA SIMPLES"
    echo "========================"
    
    local url="$API_URL/health"
    local requests=100
    local concurrency=10
    
    echo "Fazendo $requests requisições com concorrência $concurrency..."
    echo "URL: $url"
    echo ""
    
    if command -v ab > /dev/null; then
        ab -n $requests -c $concurrency "$url"
    elif command -v curl > /dev/null; then
        echo "Apache Bench não disponível, fazendo teste simples com curl..."
        local start_time=$(date +%s)
        
        for i in $(seq 1 20); do
            curl -s -o /dev/null -w "%{http_code} " "$url"
            if [ $((i % 10)) -eq 0 ]; then echo ""; fi
        done
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        echo -e "\n\nTeste concluído em ${duration}s"
    else
        echo "❌ Nenhuma ferramenta de teste disponível (ab ou curl)"
    fi
}

# Menu de opções
show_menu() {
    echo "🎛️  MONITOR DO SISTEMA TUMI GESTÃO"
    echo "=================================="
    echo ""
    echo "Opções disponíveis:"
    echo "  quick     - Verificação rápida (padrão)"
    echo "  detailed  - Monitoramento detalhado"  
    echo "  logs      - Logs em tempo real"
    echo "  test      - Teste de carga simples"
    echo "  menu      - Mostrar este menu"
    echo ""
    echo "Uso: $0 [opção]"
    echo "Exemplo: $0 detailed"
}

# Verificar dependências
check_deps() {
    local missing_deps=()
    
    if ! command -v pm2 > /dev/null; then
        missing_deps+=("pm2")
    fi
    
    if ! command -v curl > /dev/null; then
        missing_deps+=("curl")  
    fi
    
    if ! command -v jq > /dev/null; then
        echo "⚠️  Dica: Instale 'jq' para visualização melhor do JSON"
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        echo "❌ Dependências faltando: ${missing_deps[*]}"
        exit 1
    fi
}

# Main
main() {
    check_deps
    
    case "${1:-quick}" in
        "quick")
            quick_check
            ;;
        "detailed")
            detailed_monitor
            ;;
        "logs")
            live_logs
            ;;
        "test")
            load_test
            ;;
        "menu"|"help"|"-h"|"--help")
            show_menu
            ;;
        *)
            echo "❌ Opção inválida: $1"
            echo ""
            show_menu
            exit 1
            ;;
    esac
}

main "$@"