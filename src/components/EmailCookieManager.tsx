import { useState, useEffect } from 'react';
import { Search, Mail, Cookie, Trash2, Copy, Check, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface EmailCookieItem {
  id: number;
  email: string;
  cookie: string;
  createdAt: string;
}

export function EmailCookieManager() {
  const [emails, setEmails] = useState<EmailCookieItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCookie, setNewCookie] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set<number>());
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('emailCookieData');
      if (stored) {
        setEmails(JSON.parse(stored));
      }
    } catch (err) {
      toast.error('Failed to load data');
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('emailCookieData', JSON.stringify(emails));
    } catch (err) {
      toast.error('Failed to save data');
    }
  }, [emails]);

  // Add new email
  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!newCookie.trim()) {
      toast.error('Please enter a cookie');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if already exists
    if (emails.some(item => item.email === newEmail.trim())) {
      toast.error('This email already exists');
      return;
    }

    const newItem: EmailCookieItem = {
      id: Date.now(),
      email: newEmail.trim(),
      cookie: newCookie.trim(),
      createdAt: new Date().toISOString()
    };

    setEmails([newItem, ...emails]);
    setNewEmail('');
    setNewCookie('');
    setShowAddForm(false);
    toast.success('Email added successfully');
  };

  // Delete email
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this email?')) {
      setEmails(emails.filter(item => item.id !== id));
      const newExpanded = new Set(expandedIds);
      newExpanded.delete(id);
      setExpandedIds(newExpanded);
      toast.success('Email deleted');
    }
  };

  // Copy to clipboard
  const handleCopy = async (text: string, type: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(`${type}-${id}`);
      setTimeout(() => setCopiedItem(null), 2000);
      toast.success('Copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  // Toggle expand/collapse
  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Filter email list
  const filteredEmails = emails.filter(item =>
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="bg-card rounded-xl shadow-lg p-6 mb-6 border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Mail className="w-8 h-8 text-primary" />
                Email Cookie Manager
              </h1>
              <p className="text-muted-foreground mt-2">Manage your email accounts and their associated cookies</p>
            </div>
            <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
              Total: {emails.length} {emails.length === 1 ? 'email' : 'emails'}
            </div>
          </div>
        </header>

        {/* Search and Add Button */}
        <div className="bg-card rounded-xl shadow-lg p-6 mb-6 border border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search email addresses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Email
            </Button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleAddEmail} className="mt-6 pt-6 border-t border-border">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cookie Content
                  </label>
                  <Textarea
                    value={newCookie}
                    onChange={(e) => setNewCookie(e.target.value)}
                    placeholder="Paste cookie content..."
                    rows={4}
                    className="resize-none font-mono text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Confirm Add
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewEmail('');
                      setNewCookie('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Email List */}
        <div className="space-y-4">
          {filteredEmails.length === 0 ? (
            <div className="bg-card rounded-xl shadow-lg p-12 text-center border border-border">
              <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">
                {searchTerm ? 'No matching emails found' : 'No emails added yet'}
              </p>
              {!searchTerm && !showAddForm && (
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Email
                </Button>
              )}
            </div>
          ) : (
            filteredEmails.map((item) => {
              const isExpanded = expandedIds.has(item.id);
              const emailCopied = copiedItem === `email-${item.id}`;
              const cookieCopied = copiedItem === `cookie-${item.id}`;

              return (
                <div key={item.id} className="bg-card rounded-xl shadow-lg overflow-hidden border border-border hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    {/* Email Address Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                        </div>
                        <span className="text-lg font-medium text-foreground truncate">
                          {item.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleCopy(item.email, 'email', item.id)}
                          variant="secondary"
                          size="sm"
                        >
                          {emailCopied ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Email
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleDelete(item.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Cookie Area */}
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Cookie className="w-4 h-4 text-accent" />
                          Cookie Content
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleCopy(item.cookie, 'cookie', item.id)}
                            size="sm"
                            className="bg-success hover:bg-success/90 text-success-foreground"
                          >
                            {cookieCopied ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Cookie
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => toggleExpand(item.id)}
                            variant="secondary"
                            size="sm"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {isExpanded ? (
                        <div className="bg-muted rounded-lg p-4 max-h-96 overflow-auto">
                          <pre className="text-sm text-foreground whitespace-pre-wrap break-all font-mono">
                            {item.cookie}
                          </pre>
                        </div>
                      ) : (
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-sm text-muted-foreground truncate font-mono">
                            {item.cookie}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
                      <span className="bg-muted px-2 py-1 rounded">
                        Added: {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
