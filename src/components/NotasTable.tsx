
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, FileText } from 'lucide-react';

interface NotaFiscal {
  Numero_NF: string;
  Data_Emissao: string;
  MODELO: string;
  ORGANIZATION_ID: number;
  Quantidade: number;
  Empresa: string;
}

interface NotasTableProps {
  notas: NotaFiscal[];
}

const NotasTable: React.FC<NotasTableProps> = ({ notas }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredNotas = notas.filter(nota => 
    nota.Numero_NF.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nota.Empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nota.MODELO.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Detalhes das Notas Fiscais</span>
            <Badge variant="secondary">{notas.length} notas</Badge>
          </div>
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por número, série, empresa ou data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredNotas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {notas.length === 0 ? 
              'Nenhuma nota encontrada. Realize uma consulta ou comparação primeiro.' :
              'Nenhuma nota corresponde aos critérios de busca.'
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Número da Nota</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Data de Emissão</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Empresa</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Modelo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Quantidade</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Org ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotas.map((nota, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-blue-600">{nota.Numero_NF}</td>
                    <td className="py-3 px-4 text-gray-900">{formatDate(nota.Data_Emissao)}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{nota.Empresa}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{nota.MODELO}</td>
                    <td className="py-3 px-4 text-center font-medium">{nota.Quantidade}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{nota.ORGANIZATION_ID}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotasTable;
